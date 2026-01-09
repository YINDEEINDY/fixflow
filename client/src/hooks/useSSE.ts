import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '../stores/auth.store';

export type SSEEventType =
  | 'connected'
  | 'request:created'
  | 'request:updated'
  | 'request:assigned'
  | 'request:status_changed'
  | 'request:completed'
  | 'notification:new'
  | 'sla:warning'
  | 'sla:breached';

interface SSEEvent {
  type: SSEEventType;
  data: unknown;
  timestamp: string;
}

type EventHandler = (data: unknown) => void;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useSSE() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef<Map<SSEEventType, Set<EventHandler>>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const connectRef = useRef<() => void>();

  const { isAuthenticated, token } = useAuthStore();

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Create EventSource with auth token in URL (SSE doesn't support headers)
      const url = `${API_URL}/sse/events?token=${encodeURIComponent(token)}`;
      const eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onopen = () => {
        console.log('SSE Connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SSEEvent;
          const handlers = handlersRef.current.get(data.type);

          if (handlers) {
            handlers.forEach((handler) => {
              try {
                handler(data.data);
              } catch (error) {
                console.error('SSE handler error:', error);
              }
            });
          }
        } catch (error) {
          console.error('SSE parse error:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        setIsConnected(false);
        setConnectionError('Connection lost');
        eventSource.close();

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;

          console.log(`SSE Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, delay);
        } else {
          setConnectionError('Unable to connect. Please refresh the page.');
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('SSE Connection error:', error);
      setConnectionError('Failed to connect');
    }
  }, [isAuthenticated, token]);

  // Keep connectRef in sync with connect (must be in useEffect to avoid ref access during render)
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Subscribe to events
  const subscribe = useCallback((eventType: SSEEventType, handler: EventHandler) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    handlersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(eventType)?.delete(handler);
    };
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    subscribe,
    reconnect: connect,
  };
}

// Hook for subscribing to specific event types
export function useSSEEvent(eventType: SSEEventType, handler: EventHandler) {
  const { subscribe } = useSSE();

  useEffect(() => {
    const unsubscribe = subscribe(eventType, handler);
    return unsubscribe;
  }, [eventType, handler, subscribe]);
}

export default useSSE;
