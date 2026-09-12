"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * 全局 Session Provider —— 让所有子组件可以用 useSession()
 * 必须包在 Client Component 里，所以单独抽出一个 wrapper。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
