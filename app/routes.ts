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
  layout("routes/auth.tsx", [
    route("login", "routes/auth/login.tsx"),
  ]),
  route("logout", "routes/auth/logout.tsx"),

  // ─── Admin ───────────────────────────────────────────────────────────────────
  layout("routes/admin.tsx", [
    route("admin/categories", "routes/admin/categories.tsx"),
    route("admin/attributes", "routes/admin/attribute.tsx"),
    route("admin/catalogue", "routes/admin/catalogue.tsx"),
    route("admin/accounts", "routes/admin/account-management.tsx"),
    route("admin/accounts/create", "routes/admin/accounts/create.tsx"),
    route("admin/accounts/:id/update", "routes/admin/accounts/update.tsx"),
  ]),
] satisfies RouteConfig;
