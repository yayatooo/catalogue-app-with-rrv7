import AdminLayout from "~/pages/admin/admin-layout";
import { requireAuth } from "~/src/helper/auth.server";
import type { Route } from "./+types/admin";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth(request);
  return { user };
}

export default AdminLayout;
