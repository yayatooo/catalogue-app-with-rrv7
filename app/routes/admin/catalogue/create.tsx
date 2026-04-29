import { redirect } from "react-router";
import type { Route } from "./+types/create";
import { CreateCataloguePage } from "~/pages/admin/catalogue/create-catalogue";
import { createMenuItemDto } from "~/src/dto/menu-item.dto";
import {
  createMenuItem,
  listCategoriesForSelect,
  listAttributeValuesForSelect,
  addMenuItemImages,
  MenuItemServiceError,
} from "~/src/services/menu-item-services";
import { storage } from "~/src/storage";
import { storagePaths } from "~/src/helper/storage-paths";

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function loader(_: Route.LoaderArgs) {
  const [categories, attributeGroups] = await Promise.all([
    listCategoriesForSelect(),
    listAttributeValuesForSelect(),
  ]);
  return { categories, attributeGroups };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const candidate = {
    name: { en: String(formData.get("name_en") ?? "").trim() },
    description: formData.get("description") || null,
    categoryId: formData.get("categoryId") || null,
    basePrice: formData.get("basePrice") || null,
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
    attributeValueIds: formData.getAll("attributeValueIds").map(String),
  };

  const parsed = createMenuItemDto.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: candidate,
    };
  }

  try {
    const created = await createMenuItem(parsed.data);

    // Upload any images submitted with the form
    const files = formData.getAll("images") as File[];
    const validFiles = files.filter(
      (f) => f.size > 0 && ALLOWED_MIMES.has(f.type) && f.size <= MAX_SIZE,
    );

    if (validFiles.length > 0) {
      const uploaded = await Promise.all(
        validFiles.map((file) => {
          const key = storagePaths.menuItemImage(created.id, file.name);
          return storage.upload(file, key, { contentType: file.type });
        }),
      );
      await addMenuItemImages(
        created.id,
        uploaded.map((r, i) => ({ key: r.key, url: r.url, sortOrder: i })),
      );
    }

    return redirect(`/admin/catalogue`);
  } catch (err) {
    if (err instanceof MenuItemServiceError) {
      return { ok: false as const, formError: err.message, values: candidate };
    }
    throw err;
  }
}

export default CreateCataloguePage;
