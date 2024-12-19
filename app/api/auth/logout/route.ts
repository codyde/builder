import { lucia } from "@/app/auth/lucia";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  const { user, session } = await lucia.validateSession(sessionId)
  if (!session) {
    return new Response(null, {
      status: 401
    });
  }
  await lucia.invalidateSession(sessionId);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/"
    }
  });
};