import { redirect } from "react-router";
import type { Route } from "./+types/create";
import { register } from "~/src/services/auth-services";
import { registerSchema } from "~/src/dto/auth.dto";
import CreateAccount from "~/pages/admin/account-management/create-account";

export function meta() {
  return [
    { title: "Create Account | Admin" },
    { name: "description", content: "Create Account Admin" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const parsed = registerSchema.safeParse(Object.fromEntries(form));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await register(parsed.data);
    return redirect("/admin/accounts");
  } catch (err) {
    return { errors: { email: [(err as Error).message] } };
  }
}

export default CreateAccount;
