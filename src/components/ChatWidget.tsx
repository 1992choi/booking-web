'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth';
import { sendChatMessage } from '@/lib/api/assistant';
import { getErrorMessage } from '@/lib/api/axios';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import type { ChatTurn } from '@/lib/types/assistant';

export default function ChatWidget() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEscapeKey(() => setOpen(false));
  useFocusTrap(open ? panelRef : { current: null });

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const { mutate, isPending, isError, error, reset } = useMutation({
    mutationFn: (history: ChatTurn[]) =>
      sendChatMessage({ message: history[history.length - 1].content, history: history.slice(0, -1) }),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    },
  });

  if (!isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isPending) return;

    reset();
    const history = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(history);
    setInput('');
    mutate(history);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="AI 어시스턴트"
          tabIndex={-1}
          className="mb-3 w-[calc(100vw-2rem)] sm:w-80 h-[28rem] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden focus:outline-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900">AI 어시스턴트</h2>
            <button
              onClick={() => setOpen(false)}
              aria-label="닫기"
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-4">
                예약, 결제, 사용법에 대해 물어보세요.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-400">...</p>
              </div>
            )}
            {isError && (
              <p className="text-xs text-red-500 text-center">{getErrorMessage(error)}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-50 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="질문을 입력하세요"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isPending || !input.trim()}
              className="shrink-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-3 py-2 transition-colors"
            >
              전송
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'AI 어시스턴트 닫기' : 'AI 어시스턴트 열기'}
        className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        {open ? (
          <span className="text-xl leading-none">✕</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4z" />
          </svg>
        )}
      </button>
    </div>
  );
}
