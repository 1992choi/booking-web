import apiClient from './axios';
import type { ChatRequest, ChatResponse } from '@/lib/types/assistant';

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>('/assistant/chat', request, { timeout: 60_000 });
  return data;
}
