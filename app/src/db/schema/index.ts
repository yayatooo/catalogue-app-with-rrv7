import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MenuItemImage = {
  key: string;
  url: string;
  alt?: string;
  sortOrder: number;
};

// ─── Tables ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: jsonb("name").notNull().$type<Record<string, string>>(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const attributes = pgTable("attributes", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: jsonb("label").notNull().$type<Record<string, string>>(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const attributeValues = pgTable("attribute_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  attributeId: uuid("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
  label: jsonb("label").notNull().$type<Record<string, string>>(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: jsonb("name").notNull().$type<Record<string, string>>(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }),
  images: jsonb("images").notNull().default([]).$type<MenuItemImage[]>(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const menuItemAttributes = pgTable(
  "menu_item_attributes",
  {
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    attributeValueId: uuid("attribute_value_id")
      .notNull()
      .references(() => attributeValues.id, { onDelete: "cascade" }),
    priceOverride: numeric("price_override", { precision: 10, scale: 2 }),
  },
  (t) => [primaryKey({ columns: [t.menuItemId, t.attributeValueId] })],
);

export const promos = pgTable("promos", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageUrl: text("image_url").notNull(),
  link: text("link"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const attributesRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
}));

export const attributeValuesRelations = relations(
  attributeValues,
  ({ one }) => ({
    attribute: one(attributes, {
      fields: [attributeValues.attributeId],
      references: [attributes.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  attributes: many(menuItemAttributes),
}));

export const menuItemAttributesRelations = relations(
  menuItemAttributes,
  ({ one }) => ({
    menuItem: one(menuItems, {
      fields: [menuItemAttributes.menuItemId],
      references: [menuItems.id],
    }),
    attributeValue: one(attributeValues, {
      fields: [menuItemAttributes.attributeValueId],
      references: [attributeValues.id],
    }),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Attribute = typeof attributes.$inferSelect;
export type NewAttribute = typeof attributes.$inferInsert;

export type AttributeValue = typeof attributeValues.$inferSelect;
export type NewAttributeValue = typeof attributeValues.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type MenuItemAttribute = typeof menuItemAttributes.$inferSelect;
export type NewMenuItemAttribute = typeof menuItemAttributes.$inferInsert;

export type Promo = typeof promos.$inferSelect;
export type NewPromo = typeof promos.$inferInsert;
