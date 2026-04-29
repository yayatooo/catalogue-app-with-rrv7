import { Form, useActionData, useLoaderData } from "react-router";
import type { loader } from "~/routes/admin/categories/update";

type ActionData = {
  errors: { name_en?: string; slug?: string };
} | null;

const locales = [
  { key: "name_en", label: "Name (English)", required: true },
  { key: "name_km", label: "ឈ្មោះ (Khmer)", required: false },
  { key: "name_zh", label: "名称 (Chinese)", required: false },
  { key: "name_id", label: "Nama (Indonesia)", required: false },
] as const;

type LocaleKey = "name_en" | "name_km" | "name_zh" | "name_id";
const localeToField: Record<LocaleKey, string> = {
  name_en: "en",
  name_km: "km",
  name_zh: "zh",
  name_id: "id",
};

export default function UpdateCategories() {
  const { category } = useLoaderData<typeof loader>();
  const data = useActionData<ActionData>();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Edit Category</h1>
      <Form method="post" className="space-y-4">
        {locales.map(({ key, label, required }) => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              name={key}
              defaultValue={category.name?.[localeToField[key]] ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required={required}
            />
            {key === "name_en" && data?.errors?.name_en && (
              <p className="text-xs text-destructive">{data.errors.name_en}</p>
            )}
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-sm font-medium">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            name="slug"
            defaultValue={category.slug}
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
          {data?.errors?.slug && (
            <p className="text-xs text-destructive">{data.errors.slug}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Sort Order</label>
          <input
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={category.sortOrder}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            value="true"
            defaultChecked={category.isActive}
            className="h-4 w-4 rounded border"
          />
          <label htmlFor="isActive" className="text-sm font-medium">Active</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Save
          </button>
          <a href="/admin/categories" className="rounded-md border px-4 py-2 text-sm">
            Cancel
          </a>
        </div>
      </Form>
    </div>
  );
}
