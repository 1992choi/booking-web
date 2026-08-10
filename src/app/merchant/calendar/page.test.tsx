// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminReservationsPage from './page';
import { toDateKey } from '@/lib/utils/calendar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getAdminCalendar = vi.fn();
const confirmReservation = vi.fn();
const cancelReservation = vi.fn();
vi.mock('@/lib/api/adminReservations', () => ({
  getAdminCalendar: (...args: unknown[]) => getAdminCalendar(...args),
  confirmReservation: (...args: unknown[]) => confirmReservation(...args),
  cancelReservation: (...args: unknown[]) => cancelReservation(...args),
}));

const today = new Date();
const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

beforeEach(() => {
  getAdminCalendar.mockReset();
  confirmReservation.mockReset();
  cancelReservation.mockReset();
});

describe('AdminReservationsPage', () => {
  it('현재 연/월을 보여준다', async () => {
    getAdminCalendar.mockResolvedValue({});
    render(<AdminReservationsPage />);

    expect(await screen.findByText(`${today.getFullYear()}년 ${today.getMonth() + 1}월`)).toBeInTheDocument();
  });

  it('불러오기 실패 시 에러 메시지를 보여준다', async () => {
    getAdminCalendar.mockRejectedValue(new Error('network error'));
    render(<AdminReservationsPage />);

    expect(await screen.findByText('캘린더를 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('예약이 있는 날짜를 클릭하면 예약 목록을 보여준다', async () => {
    getAdminCalendar.mockResolvedValue({
      [todayKey]: [
        { reservationId: 1, resourceName: 'A동', startTime: '09:00', endTime: '10:00', status: 'PENDING' },
      ],
    });
    render(<AdminReservationsPage />);
    await screen.findByText(`${today.getFullYear()}년 ${today.getMonth() + 1}월`);

    await userEvent.click(screen.getByText(String(today.getDate())));

    expect(await screen.findByText('A동')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확정' })).toBeInTheDocument();
  });

  it('확정 버튼을 누르면 confirmReservation을 호출하고 목록을 새로고침한다', async () => {
    getAdminCalendar.mockResolvedValue({
      [todayKey]: [
        { reservationId: 1, resourceName: 'A동', startTime: '09:00', endTime: '10:00', status: 'PENDING' },
      ],
    });
    confirmReservation.mockResolvedValue(undefined);

    render(<AdminReservationsPage />);
    await screen.findByText(`${today.getFullYear()}년 ${today.getMonth() + 1}월`);
    await userEvent.click(screen.getByText(String(today.getDate())));
    await screen.findByText('A동');

    await userEvent.click(screen.getByRole('button', { name: '확정' }));

    await vi.waitFor(() => expect(confirmReservation).toHaveBeenCalledWith(1));
  });
});
