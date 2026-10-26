// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

function renderTrap(container: HTMLElement) {
  return renderHook(() => {
    const ref = useRef<HTMLElement | null>(container);
    useFocusTrap(ref);
  });
}

function pressTab(options: { shiftKey?: boolean } = {}) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey: options.shiftKey ?? false,
    bubbles: true,
    cancelable: true,
  });
  document.activeElement?.dispatchEvent(event);
  return event;
}

describe('useFocusTrap', () => {
  it('마운트 시 컨테이너 내 첫 포커스 가능 요소로 포커스를 이동한다', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="first">첫번째</button>
        <button id="second">두번째</button>
      </div>
    `;
    const container = document.getElementById('container') as HTMLElement;

    renderTrap(container);

    expect(document.activeElement).toBe(document.getElementById('first'));
  });

  it('마지막 요소에서 Tab을 누르면 첫 요소로 순환한다', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="first">첫번째</button>
        <button id="second">두번째</button>
      </div>
    `;
    const container = document.getElementById('container') as HTMLElement;
    renderTrap(container);

    (document.getElementById('second') as HTMLElement).focus();
    const event = pressTab();

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('first'));
  });

  it('첫 요소에서 Shift+Tab을 누르면 마지막 요소로 순환한다', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="first">첫번째</button>
        <button id="second">두번째</button>
      </div>
    `;
    const container = document.getElementById('container') as HTMLElement;
    renderTrap(container);

    const event = pressTab({ shiftKey: true });

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('second'));
  });

  it('언마운트 시 이전에 포커스된 요소로 복원한다', () => {
    document.body.innerHTML = `
      <button id="trigger">열기</button>
      <div id="container">
        <button id="first">첫번째</button>
      </div>
    `;
    const trigger = document.getElementById('trigger') as HTMLElement;
    trigger.focus();
    const container = document.getElementById('container') as HTMLElement;

    const { unmount } = renderTrap(container);
    expect(document.activeElement).toBe(document.getElementById('first'));

    unmount();

    expect(document.activeElement).toBe(trigger);
  });
});
