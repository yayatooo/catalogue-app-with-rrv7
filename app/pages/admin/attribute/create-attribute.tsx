import { Form, useActionData } from "react-router";

type ActionData = {
  errors: { label_en?: string; slug?: string };
} | null;

const locales = [
  { key: "label_en", label: "Label (English)", required: true },
  { key: "label_km", label: "ស្លាក (Khmer)", required: false },
  { key: "label_zh", label: "标签 (Chinese)", required: false },
  { key: "label_id", label: "Label (Indonesia)", required: false },
] as const;

export default function CreateAttribute() {
  const data = useActionData<ActionData>();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Create Attribute</h1>
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
            {key === "label_en" && data?.errors?.label_en && (
              <p className="text-xs text-destructive">{data.errors.label_en}</p>
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
            placeholder="e.g. spice-level"
            required
          />
          {data?.errors?.slug && (
            <p className="text-xs text-destructive">{data.errors.slug}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Create
          </button>
          <a
            href="/admin/attributes"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </a>
        </div>
      </Form>
    </div>
  );
}
