import { redirect } from "react-router";
import { getSessionId, clearSessionCookie } from "~/src/helper/auth.server";
import { getSession } from "~/src/services/session-services";
import { logout } from "~/src/services/auth-services";

export async function action({ request }: { request: Request }) {
  const sessionId = getSessionId(request);

  if (sessionId) {
    const session = await getSession(sessionId);
    if (session) await logout(session.userId);
  }

  return redirect("/login", {
    headers: { "Set-Cookie": clearSessionCookie() },
  });
}

export async function loader() {
  return redirect("/login");
}
