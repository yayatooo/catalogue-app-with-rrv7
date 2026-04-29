import { redirect } from "react-router"
import type { Route } from "./+types/update"
import {
  getMenuItemWithVariants,
  updateMenuItem,
  addMenuItemImages,
  reorderMenuItemImages,
  removeMenuItemImage,
  listCategoriesForSelect,
  listAttributeValuesForSelect,
  MenuItemServiceError,
} from "~/src/services/menu-item-services"
import { updateMenuItemDto } from "~/src/dto/menu-item.dto"
import { storage } from "~/src/storage"
import { storagePaths } from "~/src/helper/storage-paths"
import UpdateCatalogue from "~/pages/admin/catalogue/update.catalog"

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export function meta() {
  return [
    { title: "Update Menu Item | Admin" },
    { name: "description", content: "Update Menu Item" },
  ]
}

export async function loader({ params }: Route.LoaderArgs) {
  const item = await getMenuItemWithVariants(params.id)
  if (!item) throw redirect("/admin/catalogue")

  const [categories, attributeGroups] = await Promise.all([
    listCategoriesForSelect(),
    listAttributeValuesForSelect(),
  ])

  return { item, categories, attributeGroups }
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = form.get("intent") as string

  // ── Update item fields ─────────────────────────────────────────────────────
  if (intent === "update-item") {
    const candidate = {
      name: { en: String(form.get("name_en") ?? "").trim() },
      description: (form.get("description") as string) || null,
      categoryId: (form.get("categoryId") as string) || null,
      basePrice: form.get("basePrice") || null,
      sortOrder: form.get("sortOrder") || undefined,
      isActive: form.get("isActive") === "on",
    }

    const parsed = updateMenuItemDto.safeParse(candidate)
    if (!parsed.success) {
      return {
        ok: false as const,
        intent,
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    try {
      await updateMenuItem(params.id, parsed.data)
      return { ok: true as const, intent }
    } catch (err) {
      if (err instanceof MenuItemServiceError) {
        return { ok: false as const, intent, formError: err.message }
      }
      throw err
    }
  }

  // ── Upload images ──────────────────────────────────────────────────────────
  if (intent === "upload-images") {
    const files = (form.getAll("files") as File[]).filter(
      (f) => f instanceof File && f.size > 0,
    )

    if (files.length === 0) return { ok: false as const, intent, formError: "No files selected" }

    for (const file of files) {
      if (!ALLOWED_MIMES.has(file.type))
        return { ok: false as const, intent, formError: `Unsupported type: ${file.type}` }
      if (file.size > MAX_SIZE)
        return { ok: false as const, intent, formError: `File too large: ${file.name} (max 5 MB)` }
    }

    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const key = storagePaths.menuItemImage(params.id, file.name)
          const result = await storage.upload(file, key, { contentType: file.type })
          return { key: result.key, url: result.url, alt: file.name, sortOrder: 0 }
        }),
      )
      await addMenuItemImages(params.id, uploaded)
      return { ok: true as const, intent }
    } catch (err) {
      return { ok: false as const, intent, formError: (err as Error).message }
    }
  }

  // ── Reorder images ─────────────────────────────────────────────────────────
  if (intent === "reorder-images") {
    const raw = form.get("keys") as string
    if (!raw) return { ok: false as const, intent, formError: "Missing reorder payload" }

    let orderedKeys: string[]
    try {
      orderedKeys = JSON.parse(raw)
    } catch {
      return { ok: false as const, intent, formError: "Invalid reorder payload" }
    }

    if (!Array.isArray(orderedKeys) || orderedKeys.some((k) => typeof k !== "string")) {
      return { ok: false as const, intent, formError: "Invalid reorder payload" }
    }

    await reorderMenuItemImages(params.id, orderedKeys)
    return { ok: true as const, intent }
  }

  // ── Remove image ───────────────────────────────────────────────────────────
  if (intent === "remove-image") {
    const key = (form.get("key") as string)?.trim()
    if (!key) return { ok: false as const, intent, formError: "Missing image key" }

    try {
      await storage.delete(key)
    } catch (err) {
      // Best-effort — don't fail if storage is unreachable
      console.error("Storage delete failed:", err)
    }

    await removeMenuItemImage(params.id, key)
    return { ok: true as const, intent }
  }

  return null
}

export default UpdateCatalogue
