import type { Route } from "./+types/catalogue";
import {
  listAllMenuItems,
  deleteMenuItem,
} from "~/src/services/menu-item-services";
import IndexCatalogue from "~/pages/admin/catalogue";

export function meta() {
  return [
    { title: "Catalogue | Admin" },
    { name: "description", content: "Manage catalogue menu items" },
  ];
}

export async function loader() {
  const items = await listAllMenuItems();
  return { items };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent") as string;
  const id = form.get("id") as string;

  if (intent === "delete" && id) {
    await deleteMenuItem(id);
  }

  return null;
}

export default IndexCatalogue;
