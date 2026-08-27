import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { getErrorMessage } from './axios';

function axiosErrorWith(data: unknown): AxiosError {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: {} as never,
  });
}

describe('getErrorMessage', () => {
  it('알려진 에러 코드를 한글 메시지로 변환한다', () => {
    expect(getErrorMessage(axiosErrorWith({ code: 'RSV_001' }))).toBe(
      '이미 예약된 시간대입니다. 다른 시간을 선택해 주세요.'
    );
    expect(getErrorMessage(axiosErrorWith({ code: 'API_002' }))).toBe(
      '이메일 또는 비밀번호가 올바르지 않습니다.'
    );
    expect(getErrorMessage(axiosErrorWith({ code: 'REVIEW_003' }))).toBe(
      '이미 리뷰를 작성한 예약입니다.'
    );
    expect(getErrorMessage(axiosErrorWith({ code: 'PAY_004' }))).toBe(
      '환불 처리에 실패했습니다. 다시 시도해 주세요.'
    );
    expect(getErrorMessage(axiosErrorWith({ code: 'API_003' }))).toBe(
      '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
    );
  });

  it('알려지지 않은 코드는 detail 필드를 사용한다', () => {
    expect(getErrorMessage(axiosErrorWith({ code: 'UNKNOWN_CODE', detail: '상세 에러 메시지' }))).toBe(
      '상세 에러 메시지'
    );
  });

  it('code도 detail도 없으면 기본 메시지를 반환한다', () => {
    expect(getErrorMessage(axiosErrorWith({}))).toBe('알 수 없는 오류가 발생했습니다.');
  });

  it('response가 없는 axios 에러도 기본 메시지를 반환한다', () => {
    const err = new AxiosError('Network Error');
    expect(getErrorMessage(err)).toBe('알 수 없는 오류가 발생했습니다.');
  });

  it('axios 에러가 아닌 경우에도 기본 메시지를 반환한다', () => {
    expect(getErrorMessage(new Error('plain error'))).toBe('알 수 없는 오류가 발생했습니다.');
    expect(getErrorMessage('some string')).toBe('알 수 없는 오류가 발생했습니다.');
    expect(getErrorMessage(undefined)).toBe('알 수 없는 오류가 발생했습니다.');
  });
});
