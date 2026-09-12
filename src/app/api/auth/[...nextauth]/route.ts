import { handlers, assertAuthEnv } from "@/auth";
import { NextRequest } from "next/server";

/**
 * NextAuth v5 API Route
 * GET/POST /api/auth/[...nextauth]
 *
 * 运行时校验 AUTH_SECRET + AUTH_URL（生产环境必须），
 * 缺的话直接抛清晰错误，不再让 NextAuth 自己吞成模糊的
 * "There is a problem with the server configuration"。
 */
function withAssert(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    assertAuthEnv();
    return handler(req);
  };
}

export const GET = withAssert(handlers.GET as (req: NextRequest) => Promise<Response>);
export const POST = withAssert(handlers.POST as (req: NextRequest) => Promise<Response>);
