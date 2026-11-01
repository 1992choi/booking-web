// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatWidget from './ChatWidget';
import { useAuthStore } from '@/lib/store/auth';
import { testUser } from '@/lib/test/fixtures';
import { renderWithQuery } from '@/lib/test-utils/renderWithQuery';

const sendChatMessage = vi.fn();
vi.mock('@/lib/api/assistant', () => ({
  sendChatMessage: (...args: unknown[]) => sendChatMessage(...args),
}));

function login() {
  useAuthStore.getState().setAuth('access-1', 'refresh-1', testUser);
}

beforeEach(() => {
  sendChatMessage.mockReset();
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
    role: null,
    isAuthenticated: false,
  });
});

describe('ChatWidget', () => {
  it('비로그인 상태에서는 아무것도 렌더링하지 않는다', () => {
    renderWithQuery(<ChatWidget />);

    expect(screen.queryByLabelText('AI 어시스턴트 열기')).not.toBeInTheDocument();
  });

  it('로그인 상태에서 버튼을 누르면 패널이 열린다', async () => {
    login();
    renderWithQuery(<ChatWidget />);

    await userEvent.click(screen.getByLabelText('AI 어시스턴트 열기'));

    expect(screen.getByText('예약, 결제, 사용법에 대해 물어보세요.')).toBeInTheDocument();
  });

  it('질문을 보내면 답변이 말풍선으로 추가된다', async () => {
    login();
    sendChatMessage.mockResolvedValue({ reply: '취소는 내 예약 목록에서 가능해요.' });
    renderWithQuery(<ChatWidget />);
    await userEvent.click(screen.getByLabelText('AI 어시스턴트 열기'));

    await userEvent.type(screen.getByPlaceholderText('질문을 입력하세요'), '예약 취소 어떻게 해?');
    await userEvent.click(screen.getByRole('button', { name: '전송' }));

    expect(await screen.findByText('취소는 내 예약 목록에서 가능해요.')).toBeInTheDocument();
    expect(screen.getByText('예약 취소 어떻게 해?')).toBeInTheDocument();
    expect(sendChatMessage).toHaveBeenCalledWith({ message: '예약 취소 어떻게 해?', history: [] });
  });

  it('두 번째 질문부터는 이전 대화를 history로 함께 보낸다', async () => {
    login();
    sendChatMessage
      .mockResolvedValueOnce({ reply: '첫 답변' })
      .mockResolvedValueOnce({ reply: '두번째 답변' });
    renderWithQuery(<ChatWidget />);
    await userEvent.click(screen.getByLabelText('AI 어시스턴트 열기'));

    await userEvent.type(screen.getByPlaceholderText('질문을 입력하세요'), '첫 질문');
    await userEvent.click(screen.getByRole('button', { name: '전송' }));
    await screen.findByText('첫 답변');

    await userEvent.type(screen.getByPlaceholderText('질문을 입력하세요'), '두번째 질문');
    await userEvent.click(screen.getByRole('button', { name: '전송' }));
    await screen.findByText('두번째 답변');

    expect(sendChatMessage).toHaveBeenLastCalledWith({
      message: '두번째 질문',
      history: [
        { role: 'user', content: '첫 질문' },
        { role: 'assistant', content: '첫 답변' },
      ],
    });
  });

  it('실패하면 에러 메시지를 보여준다', async () => {
    login();
    sendChatMessage.mockRejectedValue(new Error('network error'));
    renderWithQuery(<ChatWidget />);
    await userEvent.click(screen.getByLabelText('AI 어시스턴트 열기'));

    await userEvent.type(screen.getByPlaceholderText('질문을 입력하세요'), '질문');
    await userEvent.click(screen.getByRole('button', { name: '전송' }));

    expect(await screen.findByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
  });
});
