import type { Route } from "./+types/account-management";
import { getAllUsers, deleteUser } from "~/src/services/auth-services";
import AccountManagement from "~/pages/admin/account-management/index";

export function meta() {
  return [
    { title: "Account Management | Admin" },
    { name: "description", content: "Manage admin accounts" },
  ];
}

export async function loader() {
  const users = await getAllUsers();
  return { users };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const id = form.get("id") as string;
  const intent = form.get("intent") as string;

  if (intent === "delete" && id) {
    await deleteUser(id);
  }

  return null;
}

export default AccountManagement;
