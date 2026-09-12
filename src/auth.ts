import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Email from "next-auth/providers/email";

/**
 * NextAuth v5 —— 多 provider
 *
 * 每个 provider 都是条件加载：只有真配了凭证才加入 providers 数组，
 * 这样没配的不会导致 AuthError。
 *
 * Provider 清单 & 所需 env：
 *   GitHub   —— AUTH_GITHUB_ID / SECRET
 *   Google   —— AUTH_GOOGLE_ID / SECRET
 *   Discord  —— AUTH_DISCORD_ID / SECRET
 *   Email    —— SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
 *                （或 AUTH_RESEND_KEY）
 *
 * 开发环境：AUTH_SECRET 未配置时用 dev fallback（仅本地，别部署上线）
 */

const isDev = process.env.NODE_ENV === "development";
const secret =
  process.env.AUTH_SECRET ??
  (isDev ? "dev-fallback-secret-not-for-production-2026" : undefined);

// ---- Provider 条件 ----
const providers: NextAuthConfig["providers"] = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID,
          clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
      ]
    : []),

  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),

  ...(process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET
    ? [
        Discord({
          clientId: process.env.AUTH_DISCORD_ID,
          clientSecret: process.env.AUTH_DISCORD_SECRET,
        }),
      ]
    : []),

  ...(process.env.SMTP_HOST || process.env.AUTH_RESEND_KEY
    ? [
        Email({
          ...(process.env.SMTP_HOST
            ? {
                server: {
                  host: process.env.SMTP_HOST,
                  port: Number(process.env.SMTP_PORT ?? 587),
                  auth: {
                    user: process.env.SMTP_USER ?? "",
                    pass: process.env.SMTP_PASS ?? "",
                  },
                },
                from: process.env.SMTP_FROM ?? "xingfang.wang@gmail.com",
              }
            : {}),
        }),
      ]
    : []),
];

export const authConfig: NextAuthConfig = {
  secret,
  providers,
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, profile }) {
      if (profile && "id" in profile) {
        token.providerId = String(profile.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/** 登录页用：拿到当前启用的 provider 列表 */
export function getAvailableProviders(): string[] {
  const names: string[] = [];
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)
    names.push("github");
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
    names.push("google");
  if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET)
    names.push("discord");
  if (process.env.SMTP_HOST || process.env.AUTH_RESEND_KEY)
    names.push("email");
  return names;
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
