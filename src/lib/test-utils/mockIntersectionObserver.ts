import { vi } from 'vitest';

/**
 * jsdom엔 IntersectionObserver가 없으므로 전역에 스텁을 심고,
 * 테스트에서 trigger()를 호출해 "sentinel이 화면에 들어왔다"를 시뮬레이션한다.
 */
export function mockIntersectionObserver() {
  const observe = vi.fn();
  const disconnect = vi.fn();
  let callback: IntersectionObserverCallback = () => {};

  class MockIntersectionObserver {
    constructor(cb: IntersectionObserverCallback) {
      callback = cb;
    }
    observe = observe;
    unobserve = vi.fn();
    disconnect = disconnect;
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

  return {
    observe,
    disconnect,
    trigger(isIntersecting = true) {
      callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver);
    },
  };
}
