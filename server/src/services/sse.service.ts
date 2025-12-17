import { Response } from 'express';

// Store connected clients
interface SSEClient {
  id: string;
  userId: string;
  res: Response;
  role: string;
}

const clients: Map<string, SSEClient> = new Map();

// Event types
export type SSEEventType =
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

// Add a new client
export function addClient(clientId: string, userId: string, role: string, res: Response): void {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  res.flushHeaders();

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  // Store client
  clients.set(clientId, { id: clientId, userId, res, role });

  console.log(`SSE Client connected: ${clientId} (User: ${userId}, Role: ${role})`);
  console.log(`Total connected clients: ${clients.size}`);

  // Handle client disconnect
  res.on('close', () => {
    clients.delete(clientId);
    console.log(`SSE Client disconnected: ${clientId}`);
    console.log(`Total connected clients: ${clients.size}`);
  });
}

// Remove a client
export function removeClient(clientId: string): void {
  const client = clients.get(clientId);
  if (client) {
    client.res.end();
    clients.delete(clientId);
  }
}

// Send event to a specific user
export function sendToUser(userId: string, event: SSEEvent): void {
  clients.forEach((client) => {
    if (client.userId === userId) {
      sendEvent(client, event);
    }
  });
}

// Send event to users with specific role
export function sendToRole(role: string, event: SSEEvent): void {
  clients.forEach((client) => {
    if (client.role === role) {
      sendEvent(client, event);
    }
  });
}

// Send event to all connected clients
export function broadcast(event: SSEEvent): void {
  clients.forEach((client) => {
    sendEvent(client, event);
  });
}

// Send event to admins and technicians
export function sendToStaff(event: SSEEvent): void {
  clients.forEach((client) => {
    if (client.role === 'admin' || client.role === 'technician') {
      sendEvent(client, event);
    }
  });
}

// Send event to specific client
function sendEvent(client: SSEClient, event: SSEEvent): void {
  try {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`);
  } catch (error) {
    console.error(`Failed to send event to client ${client.id}:`, error);
    clients.delete(client.id);
  }
}

// Helper function to emit request events
export function emitRequestEvent(
  type: SSEEventType,
  request: {
    id: string;
    requestNumber: string;
    title: string;
    status: string;
    priority: string;
    userId: string;
    technicianUserId?: string;
  }
): void {
  const event: SSEEvent = {
    type,
    data: request,
    timestamp: new Date().toISOString(),
  };

  // Always notify the request owner
  sendToUser(request.userId, event);

  // Notify assigned technician if exists
  if (request.technicianUserId) {
    sendToUser(request.technicianUserId, event);
  }

  // Notify all admins
  sendToRole('admin', event);
}

// Get client count
export function getClientCount(): number {
  return clients.size;
}

// Get connected user IDs
export function getConnectedUserIds(): string[] {
  const userIds = new Set<string>();
  clients.forEach((client) => userIds.add(client.userId));
  return Array.from(userIds);
}
