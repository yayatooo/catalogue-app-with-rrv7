import { useRef, useState } from "react"
import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigation } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"

// ─── Types ────────────────────────────────────────────────────────────────────

type Image = { key: string; url: string; alt?: string; sortOrder: number }

type Variant = { attributeValueId: string; priceOverride: string | null }

type Item = {
  id: string
  name: Record<string, string>
  description: string | null
  slug: string
  basePrice: string | null
  isActive: boolean
  sortOrder: number
  categoryId: string | null
  images: Image[]
  variants: Variant[]
}

type Category = { id: string; name: Record<string, string>; slug: string }

type AttributeGroup = {
  attributeId: string
  attributeLabel: Record<string, string>
  attributeSlug: string
  values: Array<{ id: string; label: Record<string, string>; slug: string }>
}

type LoaderData = { item: Item; categories: Category[]; attributeGroups: AttributeGroup[] }

type ActionData =
  | { ok: true; intent: string }
  | { ok: false; intent: string; fieldErrors: Record<string, string[]> }
  | { ok: false; intent: string; formError: string }
  | null

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"]
const MAX_MB = 5

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpdateCatalogue() {
  const { item, categories, attributeGroups } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const nav = useNavigation()
  const isUpdating = nav.state === "submitting"

  const selectedValueIds = new Set(item.variants.map((v) => v.attributeValueId))

  const updateErrors =
    actionData?.ok === false && actionData.intent === "update-item" && "fieldErrors" in actionData
      ? actionData.fieldErrors
      : undefined
  const updateFormError =
    actionData?.ok === false && actionData.intent === "update-item" && "formError" in actionData
      ? actionData.formError
      : undefined
  const updateSuccess = actionData?.ok === true && actionData.intent === "update-item"

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Menu Item</h1>
        <Link to="/admin/catalogue" className="text-sm text-muted-foreground hover:underline">
          ← Back
        </Link>
      </div>

      {/* ── Item fields ─────────────────────────────────────────────────────── */}
      <Form method="post" className="space-y-4">
        <input type="hidden" name="intent" value="update-item" />

        <Field
          label="Name"
          name="name_en"
          required
          defaultValue={item.name?.en ?? ""}
          errors={updateErrors?.["name.en"] ?? updateErrors?.name}
        />

        <div className="space-y-1">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={item.categoryId ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">— No category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name?.en ?? c.slug}
              </option>
            ))}
          </select>
          <FieldError messages={updateErrors?.categoryId} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={item.description ?? ""}
          />
          <FieldError messages={updateErrors?.description} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Base Price"
            name="basePrice"
            type="number"
            inputMode="numeric"
            defaultValue={item.basePrice ?? undefined}
            errors={updateErrors?.basePrice}
          />
          <Field
            label="Sort Order"
            name="sortOrder"
            type="number"
            defaultValue={String(item.sortOrder)}
            errors={updateErrors?.sortOrder}
          />
        </div>

        {attributeGroups.length > 0 && (
          <div className="space-y-3">
            <Label>Attributes <span className="text-xs text-muted-foreground font-normal">(read-only — edit via variants)</span></Label>
            <div className="rounded-md border border-input divide-y">
              {attributeGroups.map((group) => (
                <div key={group.attributeId} className="px-3 py-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {group.attributeLabel?.en ?? group.attributeSlug}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {group.values.map((v) => (
                      <label key={v.id} className="flex items-center gap-1.5 text-sm opacity-60">
                        <input
                          type="checkbox"
                          disabled
                          checked={selectedValueIds.has(v.id)}
                          readOnly
                          className="h-4 w-4 rounded border-input"
                        />
                        {v.label?.en ?? v.slug}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={item.isActive}
            className="h-4 w-4 rounded border-input"
          />
          Active
        </label>

        {updateFormError && (
          <p className="text-sm text-destructive border border-destructive bg-destructive/5 rounded-md p-2">
            {updateFormError}
          </p>
        )}
        {updateSuccess && (
          <p className="text-sm text-green-700 border border-green-300 bg-green-50 rounded-md p-2">
            Saved successfully.
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Form>

      {/* ── Images ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Images</h2>

        {item.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {item.images
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((img) => (
                <ImageCard key={img.key} image={img} itemId={item.id} />
              ))}
          </div>
        )}

        <ImageUploadForm itemId={item.id} actionData={actionData} />
      </section>
    </div>
  )
}

// ─── Image card with remove ────────────────────────────────────────────────────

function ImageCard({ image, itemId }: { image: Image; itemId: string }) {
  const fetcher = useFetcher()
  const isRemoving = fetcher.state !== "idle"

  return (
    <div className={`relative group rounded-md overflow-hidden border aspect-square bg-muted ${isRemoving ? "opacity-50" : ""}`}>
      <img src={image.url} alt={image.alt ?? ""} className="h-full w-full object-cover" />
      <fetcher.Form method="post" action={`/admin/catalogue/${itemId}/update`}>
        <input type="hidden" name="intent" value="remove-image" />
        <input type="hidden" name="key" value={image.key} />
        <button
          type="submit"
          disabled={isRemoving}
          className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </fetcher.Form>
    </div>
  )
}

// ─── Upload form ───────────────────────────────────────────────────────────────

function ImageUploadForm({
  itemId,
  actionData,
}: {
  itemId: string
  actionData: ActionData | undefined
}) {
  const fetcher = useFetcher()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([])
  const [clientError, setClientError] = useState<string | null>(null)
  const isUploading = fetcher.state !== "idle"

  const serverError =
    actionData?.ok === false && actionData.intent === "upload-images" && "formError" in actionData
      ? actionData.formError
      : null

  function handleFiles(files: FileList | null) {
    if (!files) return
    setClientError(null)
    const next: { name: string; url: string }[] = []
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        setClientError("Only JPEG, PNG, and WebP are allowed.")
        return
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setClientError(`Each image must be under ${MAX_MB} MB.`)
        return
      }
      next.push({ name: file.name, url: URL.createObjectURL(file) })
    }
    setPreviews(next)
  }

  function removePreview(i: number) {
    setPreviews((p) => p.filter((_, idx) => idx !== i))
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <fetcher.Form
      method="post"
      encType="multipart/form-data"
      action={`/admin/catalogue/${itemId}/update`}
      className="space-y-3"
      onSubmit={() => setPreviews([])}
    >
      <input type="hidden" name="intent" value="upload-images" />

      <label
        htmlFor="upload-files"
        className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-4 py-6 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <svg className="h-7 w-7 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span><span className="font-medium text-foreground">Click to upload</span> or drag and drop</span>
        <span className="text-xs">JPEG, PNG, WebP — max {MAX_MB} MB each</span>
        <input
          ref={inputRef}
          id="upload-files"
          name="files"
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {(clientError ?? serverError) && (
        <p className="text-xs text-destructive">{clientError ?? serverError}</p>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div key={i} className="relative group rounded-md overflow-hidden border aspect-square bg-muted">
              <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <Button type="submit" size="sm" disabled={isUploading}>
          {isUploading ? "Uploading..." : `Upload ${previews.length} image${previews.length > 1 ? "s" : ""}`}
        </Button>
      )}
    </fetcher.Form>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label, name, type = "text", required, defaultValue, errors, inputMode,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
  errors?: string[]
  inputMode?: "numeric" | "text"
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input id={name} name={name} type={type} inputMode={inputMode} defaultValue={defaultValue ?? ""} />
      <FieldError messages={errors} />
    </div>
  )
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null
  return <p className="text-xs text-destructive">{messages.join(", ")}</p>
}
