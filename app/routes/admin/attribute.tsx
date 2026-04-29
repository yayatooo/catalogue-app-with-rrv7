import type { Route } from "./+types/attribute";
import {
  getAllAttributesWithValues,
  deleteAttribute,
} from "~/src/services/attribute-services";
import IndexAttribute from "~/pages/admin/attribute/index";

export function meta() {
  return [
    { title: "Attributes | Admin" },
    { name: "description", content: "Manage item attributes and values" },
  ];
}

export async function loader() {
  const attributes = await getAllAttributesWithValues();
  return { attributes };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get("intent") as string;
  const id = form.get("id") as string;

  if (intent === "delete" && id) {
    await deleteAttribute(id);
  }

  return null;
}

export default IndexAttribute;
