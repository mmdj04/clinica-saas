import { prisma } from "@/lib/prisma";
import { getTenant } from "@/lib/multi-tenancy";
import { isDemo } from "@/lib/demo";

export interface AuditEvent {
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Registra um evento de auditoria no tenant atual.
 * NUNCA armazena dados sensíveis (senhas, tokens) no metadadata.
 */
export async function recordAudit(event: AuditEvent): Promise<void> {
  if (isDemo) return;
  try {
    const tenant = getTenant();
    await prisma.auditLog.create({
      data: {
        organizationId: tenant?.organizationId ?? null,
        actorId: tenant?.userId ?? null,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        metadata: event.metadata as never,
        ip: event.ip ?? null,
        userAgent: event.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] falha ao registrar evento", error);
  }
}

export async function listAuditLogs(
  organizationId: string,
  opts: { limit?: number; page?: number; action?: string; entityType?: string },
) {
  if (isDemo) {
    return { items: [], total: 0, page: opts.page ?? 1, limit: opts.limit ?? 50 };
  }
  const limit = Math.min(opts.limit ?? 50, 200);
  const page = Math.max(opts.page ?? 1, 1);

  const where: Record<string, unknown> = {
    organizationId,
    ...(opts.action ? { action: opts.action } : {}),
    ...(opts.entityType ? { entityType: opts.entityType } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, limit };
}