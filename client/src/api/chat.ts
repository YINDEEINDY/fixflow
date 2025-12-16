import { api } from './client';
import type { ChatMessage, ChatHistoryResponse, SendMessageResponse } from '../types/chat';

export async function sendMessage(message: string): Promise<ChatMessage> {
  const response = await api.post<SendMessageResponse>('/chat', { message });
  if (response.success && response.data) {
    return response.data.message;
  }
  throw new Error(response.error?.message || 'Failed to send message');
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const response = await api.get<ChatHistoryResponse>('/chat/history');
  if (response.success && response.data) {
    return response.data.messages;
  }
  throw new Error(response.error?.message || 'Failed to get chat history');
}
