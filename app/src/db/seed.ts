import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { pbkdf2Sync, randomBytes } from "crypto";
import {
  users,
  categories,
  attributes,
  attributeValues,
  menuItems,
  menuItemAttributes,
  settings,
} from "./schema/index";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function seed() {
  console.log("Seeding database...");

  // ─── Users ────────────────────────────────────────────────────────────────
  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@shudaxiakh.com",
      passwordHash: hashPassword("admin123"),
      name: "Bun Theara",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  console.log("✓ Users seeded");

  // ─── Categories ───────────────────────────────────────────────────────────
  const [catDrinks, catFood] = await db
    .insert(categories)
    .values([
      { name: { en: "Drinks", km: "គ្រឿងផឹក" }, slug: "drinks", sortOrder: 0 },
      { name: { en: "Food", km: "អាហារ" }, slug: "food", sortOrder: 1 },
    ])
    .onConflictDoNothing()
    .returning();

  console.log("✓ Categories seeded");

  // ─── Attributes ───────────────────────────────────────────────────────────
  const [attrSize, attrSpice] = await db
    .insert(attributes)
    .values([
      { label: { en: "Size", km: "ទំហំ" }, slug: "size" },
      { label: { en: "Spice Level", km: "កម្រិតហឹរ" }, slug: "spice-level" },
    ])
    .onConflictDoNothing()
    .returning();

  console.log("✓ Attributes seeded");

  // ─── Attribute Values ─────────────────────────────────────────────────────
  const attrValueRows = await db
    .insert(attributeValues)
    .values([
      { attributeId: attrSize.id, label: { en: "Small", km: "តូច" }, slug: "small", sortOrder: 0 },
      { attributeId: attrSize.id, label: { en: "Medium", km: "មធ្យម" }, slug: "medium", sortOrder: 1 },
      { attributeId: attrSize.id, label: { en: "Large", km: "ធំ" }, slug: "large", sortOrder: 2 },
      { attributeId: attrSpice.id, label: { en: "Mild", km: "មិនហឹរ" }, slug: "mild", sortOrder: 0 },
      { attributeId: attrSpice.id, label: { en: "Medium", km: "ហឹរបន្តិច" }, slug: "spice-medium", sortOrder: 1 },
      { attributeId: attrSpice.id, label: { en: "Hot", km: "ហឹរ" }, slug: "hot", sortOrder: 2 },
    ])
    .onConflictDoNothing()
    .returning();

  const [small, medium, large, mild, spiceMedium, hot] = attrValueRows;
  console.log("✓ Attribute values seeded");

  // ─── Menu Items ───────────────────────────────────────────────────────────
  const [itemTea, itemNoodle] = await db
    .insert(menuItems)
    .values([
      {
        categoryId: catDrinks?.id,
        name: { en: "Milk Tea", km: "តែទឹកដោះគោ" },
        slug: "milk-tea",
        basePrice: "2.50",
        images: [],
        isActive: true,
        sortOrder: 0,
      },
      {
        categoryId: catFood?.id,
        name: { en: "Beef Noodle", km: "មីគោ" },
        slug: "beef-noodle",
        basePrice: "4.00",
        images: [],
        isActive: true,
        sortOrder: 0,
      },
    ])
    .onConflictDoNothing()
    .returning();

  console.log("✓ Menu items seeded");

  // ─── Menu Item Attributes ─────────────────────────────────────────────────
  if (itemTea && small && medium && large) {
    await db
      .insert(menuItemAttributes)
      .values([
        { menuItemId: itemTea.id, attributeValueId: small.id, priceOverride: "2.00" },
        { menuItemId: itemTea.id, attributeValueId: medium.id, priceOverride: "2.50" },
        { menuItemId: itemTea.id, attributeValueId: large.id, priceOverride: "3.00" },
      ])
      .onConflictDoNothing();
  }

  if (itemNoodle && mild && spiceMedium && hot) {
    await db
      .insert(menuItemAttributes)
      .values([
        { menuItemId: itemNoodle.id, attributeValueId: mild.id },
        { menuItemId: itemNoodle.id, attributeValueId: spiceMedium.id },
        { menuItemId: itemNoodle.id, attributeValueId: hot.id },
      ])
      .onConflictDoNothing();
  }

  console.log("✓ Menu item attributes seeded");

  // ─── Settings ─────────────────────────────────────────────────────────────
  await db
    .insert(settings)
    .values([
      { key: "restaurant_name", value: "Shu Da Xia" },
      { key: "restaurant_phone", value: "+855 12 345 678" },
      { key: "default_language", value: "en" },
    ])
    .onConflictDoNothing();

  console.log("✓ Settings seeded");
  console.log("\nSeed complete!");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
