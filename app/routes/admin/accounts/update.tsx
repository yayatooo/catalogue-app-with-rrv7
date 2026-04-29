import { redirect } from "react-router";
import type { Route } from "./+types/update";
import { getUserById, updatePassword } from "~/src/services/auth-services";
import { updatePasswordSchema } from "~/src/dto/auth.dto";
import UpdateAccount from "~/pages/admin/account-management/update-account";

export function meta() {
  return [
    { title: "Update Password Account | Admin" },
    { name: "description", content: "Update Password Account Admin" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const user = await getUserById(params.id);
  if (!user) throw redirect("/admin/accounts");
  return { user };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(form));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await updatePassword(params.id, parsed.data.newPassword);
    return redirect("/admin/accounts");
  } catch (err) {
    return { errors: { currentPassword: [(err as Error).message] } };
  }
}

export default UpdateAccount;
