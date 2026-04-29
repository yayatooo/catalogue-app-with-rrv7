import { redirect } from "react-router";
import { createAttribute } from "~/src/services/attribute-services";
import CreateAttribute from "~/pages/admin/attribute/create-attribute";

export function meta() {
  return [
    { title: "Create Attribute and Values | Admin" },
    { name: "description", content: "Create Attribute and Values" },
  ];
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();

  const label_en = (form.get("label_en") as string)?.trim();
  const label_km = (form.get("label_km") as string)?.trim();
  const label_zh = (form.get("label_zh") as string)?.trim();
  const label_id = (form.get("label_id") as string)?.trim();
  const slug = (form.get("slug") as string)?.trim();

  const errors: Record<string, string> = {};
  if (!label_en) errors.label_en = "English label is required";
  if (!slug) errors.slug = "Slug is required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    errors.slug = "Slug must be lowercase-kebab-case";

  if (Object.keys(errors).length > 0) return { errors };

  const label: Record<string, string> = { en: label_en };
  if (label_km) label.km = label_km;
  if (label_zh) label.zh = label_zh;
  if (label_id) label.id = label_id;

  try {
    await createAttribute({ label, slug });
    return redirect("/admin/attributes");
  } catch (err) {
    return { errors: { slug: (err as Error).message } };
  }
}

export default CreateAttribute;
