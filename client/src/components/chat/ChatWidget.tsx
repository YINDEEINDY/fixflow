import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Bot, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { sendMessage, getChatHistory } from '../../api/chat';
import type { ChatMessage as ChatMessageType } from '../../types/chat';
import { useAuthStore } from '../../stores/auth.store';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when opening
  useEffect(() => {
    if (isOpen && messages.length === 0 && isAuthenticated) {
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated]);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await getChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Show welcome message if no history
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'สวัสดีครับ! ผมคือ FixFlow AI Assistant ผมพร้อมช่วยเหลือคุณเกี่ยวกับการแจ้งซ่อมและการใช้งานระบบครับ\n\nคุณสามารถถามผมได้เช่น:\n- วิธีแจ้งซ่อมทำอย่างไร?\n- สถานะงานของฉันเป็นอย่างไร?\n- ระดับความเร่งด่วนมีอะไรบ้าง?',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Show welcome message on error
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'สวัสดีครับ! ผมคือ FixFlow AI Assistant ผมพร้อมช่วยเหลือคุณเกี่ยวกับการแจ้งซ่อมและการใช้งานระบบครับ',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message immediately
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(content);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'ขอโทษครับ เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 rounded-full shadow-lg',
          'bg-primary-500 hover:bg-primary-600 text-white',
          'flex items-center justify-center',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat window */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-96 h-[600px] max-h-[80vh]',
          'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',
          'border border-gray-200 dark:border-gray-700',
          'flex flex-col',
          'transition-all duration-300 ease-in-out transform',
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-primary-500 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">FixFlow AI Assistant</h3>
              <p className="text-xs text-white/80">พร้อมช่วยเหลือคุณ</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-white/80 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-gray-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading || isLoadingHistory}
            placeholder="พิมพ์ข้อความ..."
          />
        </div>
      </div>
    </>
  );
}
