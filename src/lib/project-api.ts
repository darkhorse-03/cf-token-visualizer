import { createServerFn } from "@tanstack/react-start";
import { eq, and, or } from "drizzle-orm";
import { getDb } from "#/db";
import { requireSession } from "#/lib/auth-session.server";
import { getOrgIdFromCookie } from "#/lib/active-context";
import { projects, projectResources } from "#/db/app-schema";

export const listProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await requireSession();
    const db = getDb();
    const orgId = getOrgIdFromCookie();

    return db
      .select()
      .from(projects)
      .where(
        or(
          eq(projects.userId, session.user.id),
          orgId
            ? and(eq(projects.orgId, orgId), eq(projects.shared, true))
            : undefined,
        ),
      );
  },
);

export const getProject = createServerFn({ method: "POST" })
  .inputValidator((projectId: string) => projectId)
  .handler(async ({ data: projectId }) => {
    const session = await requireSession();
    const db = getDb();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) throw new Error("Project not found");
    if (project.userId !== session.user.id && !project.shared) {
      throw new Error("Access denied");
    }

    const resources = await db
      .select()
      .from(projectResources)
      .where(eq(projectResources.projectId, projectId));

    return { ...project, resources };
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; orgId?: string }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const db = getDb();

    const id = crypto.randomUUID();
    await db.insert(projects).values({
      id,
      userId: session.user.id,
      orgId: data.orgId ?? null,
      name: data.name,
      shared: false,
      createdAt: new Date(),
    });

    return { id };
  });

export const updateProject = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; name?: string; shared?: boolean }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession();
    const db = getDb();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.id))
      .limit(1);

    if (!project || project.userId !== session.user.id) {
      throw new Error("Access denied");
    }

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.shared !== undefined) updates.shared = data.shared;

    await db.update(projects).set(updates).where(eq(projects.id, data.id));
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator((projectId: string) => projectId)
  .handler(async ({ data: projectId }) => {
    const session = await requireSession();
    const db = getDb();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project || project.userId !== session.user.id) {
      throw new Error("Access denied");
    }

    await db.delete(projects).where(eq(projects.id, projectId));
    return { ok: true };
  });

export const addResourceToProject = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { projectId: string; resourceType: string; resourceId: string }) => data,
  )
  .handler(async ({ data }) => {
    const session = await requireSession();
    const db = getDb();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .limit(1);

    if (!project || project.userId !== session.user.id) {
      throw new Error("Access denied");
    }

    await db
      .insert(projectResources)
      .values({
        id: crypto.randomUUID(),
        projectId: data.projectId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
      })
      .onConflictDoNothing();

    return { ok: true };
  });

export const removeResourceFromProject = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { projectId: string; resourceType: string; resourceId: string }) => data,
  )
  .handler(async ({ data }) => {
    const session = await requireSession();
    const db = getDb();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .limit(1);

    if (!project || project.userId !== session.user.id) {
      throw new Error("Access denied");
    }

    await db
      .delete(projectResources)
      .where(
        and(
          eq(projectResources.projectId, data.projectId),
          eq(projectResources.resourceType, data.resourceType),
          eq(projectResources.resourceId, data.resourceId),
        ),
      );

    return { ok: true };
  });
