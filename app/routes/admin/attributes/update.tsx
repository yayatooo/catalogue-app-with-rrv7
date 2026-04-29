import { redirect } from "react-router";
import {
  getAttributeWithValues,
  updateAttribute,
  createAttributeValue,
  deleteAttributeValue,
} from "~/src/services/attribute-services";
import UpdateAttribute from "~/pages/admin/attribute/update-attribute";

export function meta() {
  return [
    { title: "Update Attribute and Values | Admin" },
    { name: "description", content: "Update Attribute and Values" },
  ];
}

export async function loader({ params }: { params: { id: string } }) {
  const attribute = await getAttributeWithValues(params.id);
  if (!attribute) throw redirect("/admin/attributes");
  return { attribute };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const form = await request.formData();
  const intent = form.get("intent") as string;

  if (intent === "update-attribute") {
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
      await updateAttribute(params.id, { label, slug });
      return redirect("/admin/attributes");
    } catch (err) {
      return { errors: { slug: (err as Error).message } };
    }
  }

  if (intent === "add-value") {
    const label_en = (form.get("val_label_en") as string)?.trim();
    const label_km = (form.get("val_label_km") as string)?.trim();
    const label_zh = (form.get("val_label_zh") as string)?.trim();
    const label_id = (form.get("val_label_id") as string)?.trim();
    const slug = (form.get("val_slug") as string)?.trim();
    const sortOrder = parseInt(form.get("val_sortOrder") as string) || 0;

    const errors: Record<string, string> = {};
    if (!label_en) errors.val_label_en = "English label is required";
    if (!slug) errors.val_slug = "Slug is required";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      errors.val_slug = "Slug must be lowercase-kebab-case";

    if (Object.keys(errors).length > 0) return { errors };

    const label: Record<string, string> = { en: label_en! };
    if (label_km) label.km = label_km;
    if (label_zh) label.zh = label_zh;
    if (label_id) label.id = label_id;

    try {
      await createAttributeValue({
        attributeId: params.id,
        label,
        slug,
        sortOrder,
      });
    } catch (err) {
      return { errors: { val_slug: (err as Error).message } };
    }

    return null;
  }

  if (intent === "delete-value") {
    const valueId = form.get("valueId") as string;
    if (valueId) await deleteAttributeValue(valueId);
    return null;
  }

  return null;
}

export default UpdateAttribute;
