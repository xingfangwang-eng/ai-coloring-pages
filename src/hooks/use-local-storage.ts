"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * localStorage hook —— SSR 安全，无 hydration mismatch
 *
 * 核心技巧：useState 初始值永远是 initialValue，
 * 真正读取 localStorage 放在 useEffect 里（只在客户端 mount 后执行）。
 * 这样 SSR 输出的首帧和客户端首帧完全一致，hydration 不崩。
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // SSR 和客户端首帧都用 initialValue —— 保证一致
  const [value, setValue] = useState<T>(initialValue);
  const didRead = useRef(false);

  // mount 后异步读取 localStorage，替换 state
  useEffect(() => {
    if (didRead.current) return;
    didRead.current = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        setValue(parsed);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // value 变化时写回 localStorage
  useEffect(() => {
    // 跳过首次 render（那时候 value 还是 initialValue，不该覆盖 localStorage 的真实值）
    if (!didRead.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 配额溢出 / 隐私模式，静默忽略
    }
  }, [key, value]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, remove] as const;
}
