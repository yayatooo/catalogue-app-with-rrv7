import type { Route } from "./+types/categories";
import { getAllCategories, deleteCategory } from "~/src/services/categories-services";
import IndexCategories from "~/pages/admin/categories/index";

export function meta() {
  return [
    { title: "Categories | Admin" },
    { name: "description", content: "Manage menu categories" },
  ];
}

export async function loader() {
  const categories = await getAllCategories();
  return { categories };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const id = form.get("id") as string;
  const intent = form.get("intent") as string;

  if (intent === "delete" && id) {
    await deleteCategory(id);
  }

  return null;
}

export default IndexCategories;
