import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // ─── Public / Customer ───────────────────────────────────────────────────────
  layout("routes/main.tsx", [
    index("pages/main/main.tsx"),
    route("catalogue/:slug", "routes/main/detail-catalogue.tsx"),
    route("favorites", "routes/main/favorites.tsx"),
  ]),

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  layout("routes/auth.tsx", [route("login", "routes/auth/login.tsx")]),
  route("logout", "routes/auth/logout.tsx"),

  // ─── Admin ───────────────────────────────────────────────────────────────────
  layout("routes/admin.tsx", [
    route("admin/categories", "routes/admin/categories.tsx"),
    route("admin/categories/create", "routes/admin/categories/create.tsx"),
    route("admin/categories/:id/update", "routes/admin/categories/update.tsx"),
    route("admin/attributes", "routes/admin/attribute.tsx"),
    route("admin/attributes/create", "routes/admin/attributes/create.tsx"),
    route("admin/attributes/:id/update", "routes/admin/attributes/update.tsx"),
    route("admin/catalogue", "routes/admin/catalogue.tsx"),
    route("admin/catalogue/create", "routes/admin/catalogue/create.tsx"),
    route("admin/catalogue/:id/update", "routes/admin/catalogue/update.tsx"),
    route("admin/promo", "routes/admin/promo.tsx"),
    route("admin/accounts", "routes/admin/account-management.tsx"),
    route("admin/accounts/create", "routes/admin/accounts/create.tsx"),
    route("admin/accounts/:id/update", "routes/admin/accounts/update.tsx"),
  ]),
  // ─── Catch-all (silences Chrome DevTools probes) ─────────────────────────────
  route("*", "routes/catchall.tsx"),
] satisfies RouteConfig;
