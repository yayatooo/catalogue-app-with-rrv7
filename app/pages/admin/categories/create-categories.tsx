import { Form, useActionData } from "react-router";

type ActionData = {
  errors: { name_en?: string; slug?: string };
} | null;

const locales = [
  { key: "name_en", label: "Name (English)", required: true },
  { key: "name_km", label: "ឈ្មោះ (Khmer)", required: false },
  { key: "name_zh", label: "名称 (Chinese)", required: false },
  { key: "name_id", label: "Nama (Indonesia)", required: false },
] as const;

export default function CreateCategories() {
  const data = useActionData<ActionData>();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Create Category</h1>
      <Form method="post" className="space-y-4">
        {locales.map(({ key, label, required }) => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
            <input
              name={key}
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
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. hot-drinks"
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
            defaultValue={0}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            value="true"
            defaultChecked
            className="h-4 w-4 rounded border"
          />
          <label htmlFor="isActive" className="text-sm font-medium">Active</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Create
          </button>
          <a href="/admin/categories" className="rounded-md border px-4 py-2 text-sm">
            Cancel
          </a>
        </div>
      </Form>
    </div>
  );
}
