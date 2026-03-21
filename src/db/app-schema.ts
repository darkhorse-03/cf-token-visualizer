import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { organizations, users } from "./auth-schema";

// ─── Org CF Token (one per org) ─────────────────────────────────────────────

export const orgCfTokens = sqliteTable("org_cf_tokens", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .unique()
    .references(() => organizations.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── Cached CF Resources ────────────────────────────────────────────────────

export const orgCachedResources = sqliteTable(
  "org_cached_resources",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    resourceName: text("resource_name").notNull(),
    lastSynced: integer("last_synced", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("org_resource_unique").on(
      table.orgId,
      table.resourceType,
      table.resourceId,
    ),
  ],
);

// ─── Per-User Resource Permissions ──────────────────────────────────────────

export const orgUserPermissions = sqliteTable(
  "org_user_permissions",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
  },
  (table) => [
    uniqueIndex("org_user_resource_unique").on(
      table.orgId,
      table.userId,
      table.resourceType,
      table.resourceId,
    ),
  ],
);

// ─── Projects (user-created resource groupings) ─────────────────────────────

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orgId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  shared: integer("shared", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const projectResources = sqliteTable(
  "project_resources",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
  },
  (table) => [
    uniqueIndex("project_resource_unique").on(
      table.projectId,
      table.resourceType,
      table.resourceId,
    ),
  ],
);
