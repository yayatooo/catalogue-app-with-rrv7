import * as XLSX from "xlsx";
import {
  menuItemImportRowDto,
  type MenuItemImportRow,
} from "~/src/dto/menu-item-import.dto";
import { slugify } from "./slugify";

export type ParsedRow =
  | {
      rowNumber: number;
      status: "valid";
      data: MenuItemImportRow;
      raw: Record<string, unknown>;
    }
  | {
      rowNumber: number;
      status: "invalid";
      errors: Record<string, string[]>;
      raw: Record<string, unknown>;
    };

const ATTR_BOOL = /^attr_([a-z0-9-]+)_([a-z0-9-]+)$/;
const ATTR_PRICE = /^attr_([a-z0-9-]+)_([a-z0-9-]+)_price$/;

export async function parseMenuItemXlsx(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : null;
  if (!sheet) throw new Error("Workbook has no sheets");

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rows.map((raw, idx) => {
    const rowNumber = idx + 2; // +1 header, +1 zero-index
    const variants = extractVariants(raw);

    const candidate = {
      nameEn: String(raw.name_en ?? "").trim(),
      description: raw.description ? String(raw.description) : null,
      categorySlug: slugify(String(raw.category ?? "")),
      basePrice: raw.base_price === "" ? null : raw.base_price,
      sortOrder: raw.sort_order === "" ? 0 : raw.sort_order,
      isActive: raw.is_active === "" ? true : raw.is_active,
      variants,
    };

    const parsed = menuItemImportRowDto.safeParse(candidate);
    if (parsed.success) {
      return { rowNumber, status: "valid", data: parsed.data, raw };
    }
    return {
      rowNumber,
      status: "invalid",
      errors: parsed.error.flatten().fieldErrors,
      raw,
    };
  });
}

function extractVariants(raw: Record<string, unknown>) {
  const priceMap = new Map<string, unknown>();
  for (const [col, val] of Object.entries(raw)) {
    const m = col.match(ATTR_PRICE);
    if (m) priceMap.set(`${m[1]}|${m[2]}`, val);
  }

  const variants: Array<{
    attributeSlug: string;
    valueSlug: string;
    priceOverride: unknown;
  }> = [];
  for (const [col, val] of Object.entries(raw)) {
    if (col.endsWith("_price")) continue;
    const m = col.match(ATTR_BOOL);
    if (!m) continue;
    if (!isTruthy(val)) continue;

    const [, attribute, value] = m;
    const priceVal = priceMap.get(`${attribute}|${value}`);
    variants.push({
      attributeSlug: attribute,
      valueSlug: value,
      priceOverride: priceVal === "" || priceVal == null ? null : priceVal,
    });
  }
  return variants;
}

function isTruthy(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string")
    return ["true", "1", "yes", "y"].includes(v.toLowerCase().trim());
  return false;
}
