import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function auditRoutes(fastify: FastifyInstance) {
    // GET /api/audit — List audit log entries
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { scopeLevel } = request.user as any;
            if (scopeLevel !== 'ALL') {
                return reply.code(403).send({ error: 'Solo administradores pueden ver el log de auditoria' });
            }

            const query = request.query as Record<string, string>;
            const page = Math.max(0, Number(query.page) || 0);
            const limit = Math.min(100, Math.max(10, Number(query.limit) || 50));
            const entity = query.entity || undefined;
            const action = query.action || undefined;
            const userId = query.userId || undefined;

            const where: any = {};
            if (entity) where.entity = entity;
            if (action) where.action = action;
            if (userId) where.userId = userId;

            const [logs, total] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip: page * limit,
                    take: limit,
                }),
                prisma.auditLog.count({ where }),
            ]);

            return { data: logs, total, page, limit };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener log de auditoria' });
        }
    });

    // POST /api/audit — Create audit log entry (internal use)
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const user = request.user as any;
            const body = request.body as {
                action: string;
                entity: string;
                entityId?: string;
                description: string;
                changes?: Record<string, any>;
                metadata?: Record<string, any>;
            };

            const log = await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    userName: `${user.firstName} ${user.lastName}`,
                    userEmail: user.email,
                    action: body.action,
                    entity: body.entity,
                    entityId: body.entityId || null,
                    description: body.description,
                    changes: body.changes || undefined,
                    metadata: body.metadata || undefined,
                    companyCode: (request.companyCode as string) || 'CR',
                    ipAddress: request.ip,
                },
            });

            return { success: true, id: log.id };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al crear entrada de auditoria' });
        }
    });

    // GET /api/audit/stats — Audit summary stats
    fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { scopeLevel } = request.user as any;
            if (scopeLevel !== 'ALL') {
                return reply.code(403).send({ error: 'Solo administradores' });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);

            const [totalLogs, todayLogs, weekLogs, byAction, byEntity] = await Promise.all([
                prisma.auditLog.count(),
                prisma.auditLog.count({ where: { createdAt: { gte: today } } }),
                prisma.auditLog.count({ where: { createdAt: { gte: weekAgo } } }),
                prisma.auditLog.groupBy({ by: ['action'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
                prisma.auditLog.groupBy({ by: ['entity'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
            ]);

            return {
                total: totalLogs,
                today: todayLogs,
                thisWeek: weekLogs,
                byAction: byAction.map((a: any) => ({ action: a.action, count: a._count.id })),
                byEntity: byEntity.map((e: any) => ({ entity: e.entity, count: e._count.id })),
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener estadisticas de auditoria' });
        }
    });
}
