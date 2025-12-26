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

// AI Category Suggestion
export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

interface SuggestCategoryResponse {
  suggestion: CategorySuggestion;
}

export async function suggestCategory(
  title: string,
  description?: string
): Promise<CategorySuggestion> {
  const response = await api.post<SuggestCategoryResponse>('/chat/suggest-category', {
    title,
    description,
  });
  if (response.success && response.data) {
    return response.data.suggestion;
  }
  throw new Error(response.error?.message || 'Failed to get category suggestion');
}
