import { Bot, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'flex-1 max-w-[80%] px-4 py-2 rounded-2xl break-words',
          isUser
            ? 'bg-primary-500 text-white rounded-tr-sm'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span
          className={cn(
            'text-xs mt-1 block opacity-70',
            isUser ? 'text-white' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
