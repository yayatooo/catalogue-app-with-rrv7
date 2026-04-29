import { useState, useRef } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

type Category = { id: string; name: Record<string, string>; slug: string };

type AttributeGroup = {
  attributeId: string;
  attributeLabel: Record<string, string>;
  attributeSlug: string;
  values: Array<{ id: string; label: Record<string, string>; slug: string }>;
};

type CandidateValues = {
  name: { en: string };
  description: string | null;
  categoryId: string | null;
  basePrice: string | null;
  sortOrder: string | number;
  isActive: boolean;
  attributeValueIds: string[];
};

type ActionData =
  | { ok: false; fieldErrors: Record<string, string[]>; values: CandidateValues }
  | { ok: false; formError: string; values: CandidateValues }
  | null;

type LoaderData = { categories: Category[]; attributeGroups: AttributeGroup[] };

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

export function CreateCataloguePage() {
  const { categories, attributeGroups } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const nav = useNavigation();
  const isSubmitting = nav.state === "submitting";

  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fieldErrors =
    actionData && !actionData.ok && "fieldErrors" in actionData
      ? actionData.fieldErrors
      : undefined;
  const formError =
    actionData && !actionData.ok && "formError" in actionData
      ? actionData.formError
      : undefined;
  const values = actionData && !actionData.ok ? actionData.values : undefined;

  function handleFiles(files: FileList | null) {
    if (!files) return;
    setImageError(null);

    const next: { name: string; url: string }[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        setImageError("Only JPEG, PNG, and WebP images are allowed.");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setImageError(`Each image must be under ${MAX_MB} MB.`);
        return;
      }
      next.push({ name: file.name, url: URL.createObjectURL(file) });
    }
    setPreviews(next);
  }

  function removePreview(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    // Reset the file input so the same files can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Menu Item</h1>
        <Link
          to="/admin/catalogue"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back
        </Link>
      </div>

      <Form method="post" encType="multipart/form-data" className="space-y-4">
        <Field
          label="Name"
          name="name_en"
          required
          defaultValue={values?.name?.en}
          errors={fieldErrors?.["name.en"] ?? fieldErrors?.name}
        />

        <div className="space-y-1">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={values?.categoryId ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">— No category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name?.en ?? c.slug}
              </option>
            ))}
          </select>
          <FieldError messages={fieldErrors?.categoryId} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={values?.description ?? ""}
          />
          <FieldError messages={fieldErrors?.description} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Base Price"
            name="basePrice"
            type="number"
            inputMode="numeric"
            defaultValue={values?.basePrice ?? undefined}
            errors={fieldErrors?.basePrice}
          />
          <Field
            label="Sort Order"
            name="sortOrder"
            type="number"
            defaultValue={String(values?.sortOrder ?? "0")}
            errors={fieldErrors?.sortOrder}
          />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label>Images</Label>

          {/* Drop zone */}
          <label
            htmlFor="images"
            className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-4 py-8 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <svg
              className="h-8 w-8 text-muted-foreground/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span>
              <span className="font-medium text-foreground">Click to upload</span>{" "}
              or drag and drop
            </span>
            <span className="text-xs">JPEG, PNG, WebP — max {MAX_MB} MB each</span>
            <input
              ref={inputRef}
              id="images"
              name="images"
              type="file"
              accept={ACCEPTED.join(",")}
              multiple
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          {imageError && (
            <p className="text-xs text-destructive">{imageError}</p>
          )}

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((p, i) => (
                <div key={i} className="relative group rounded-md overflow-hidden border aspect-square bg-muted">
                  <img
                    src={p.url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${p.name}`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {attributeGroups.length > 0 && (
          <div className="space-y-3">
            <Label>Attributes</Label>
            <div className="rounded-md border border-input divide-y">
              {attributeGroups.map((group) => (
                <div key={group.attributeId} className="px-3 py-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {group.attributeLabel?.en ?? group.attributeSlug}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {group.values.map((v) => (
                      <label key={v.id} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          name="attributeValueIds"
                          value={v.id}
                          defaultChecked={values?.attributeValueIds?.includes(v.id)}
                          className="h-4 w-4 rounded border-input"
                        />
                        {v.label?.en ?? v.slug}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <FieldError messages={fieldErrors?.attributeValueIds} />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={values ? Boolean(values.isActive) : true}
            className="h-4 w-4 rounded border-input"
          />
          Active
        </label>

        {formError && (
          <p className="text-sm text-destructive border border-destructive bg-destructive/5 rounded-md p-2">
            {formError}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
          <Link to="/admin/catalogue">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Slug will be auto-generated from the name.
        </p>
      </Form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  errors,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  errors?: string[];
  inputMode?: "numeric" | "text";
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        defaultValue={defaultValue ?? ""}
      />
      <FieldError messages={errors} />
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-destructive">{messages.join(", ")}</p>;
}
