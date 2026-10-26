'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function useQueryParamState<T extends string>(
  key: string,
  defaultValue: T,
  allowedValues: readonly T[],
): [T, (value: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState<T>(() => {
    const raw = searchParams.get(key);
    return raw !== null && (allowedValues as readonly string[]).includes(raw) ? (raw as T) : defaultValue;
  });

  function setQueryParamState(next: T) {
    setValue(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return [value, setQueryParamState];
}
