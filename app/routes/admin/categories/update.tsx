import { redirect } from "react-router";
import {
  getCategoryById,
  updateCategory,
} from "~/src/services/categories-services";
import UpdateCategories from "~/pages/admin/categories/update-categories";

export function meta() {
  return [
    { title: "Update Categories | Admin" },
    { name: "description", content: "Update Categories" },
  ];
}

export async function loader({ params }: { params: { id: string } }) {
  const category = await getCategoryById(params.id);
  if (!category) throw redirect("/admin/categories");
  return { category };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const form = await request.formData();

  const name_en = (form.get("name_en") as string)?.trim();
  const name_km = (form.get("name_km") as string)?.trim();
  const name_zh = (form.get("name_zh") as string)?.trim();
  const name_id = (form.get("name_id") as string)?.trim();
  const slug = (form.get("slug") as string)?.trim();
  const sortOrder = parseInt(form.get("sortOrder") as string) || 0;
  const isActive = form.get("isActive") !== null;

  const errors: Record<string, string> = {};
  if (!name_en) errors.name_en = "English name is required";
  if (!slug) errors.slug = "Slug is required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    errors.slug = "Slug must be lowercase-kebab-case";

  if (Object.keys(errors).length > 0) return { errors };

  const name: Record<string, string> = { en: name_en };
  if (name_km) name.km = name_km;
  if (name_zh) name.zh = name_zh;
  if (name_id) name.id = name_id;

  try {
    await updateCategory(params.id, { name, slug, sortOrder, isActive });
    return redirect("/admin/categories");
  } catch (err) {
    return { errors: { slug: (err as Error).message } };
  }
}

export default UpdateCategories;
