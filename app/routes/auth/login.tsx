import { redirect } from "react-router";
import { requireGuest, createSessionCookie } from "~/src/helper/auth.server";
import { login } from "~/src/services/auth-services";
import { loginSchema } from "~/src/dto/auth.dto";
import Login from "../../pages/auth/login";

export async function loader({ request }: { request: Request }) {
  await requireGuest(request);
  return null;
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();

  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  try {
    const { session } = await login(parsed.data.email, parsed.data.password);

    return redirect("/admin/catalogue", {
      headers: {
        "Set-Cookie": createSessionCookie(session.id, session.expiresAt),
      },
    });
  } catch {
    return { error: "Invalid email or password" };
  }
}

export default Login;
