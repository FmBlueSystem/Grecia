import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { COMPANIES, CountryCode } from '../config/companies';

export default async function adminRoutes(fastify: FastifyInstance) {
    // GET /api/admin/companies - Listar empresas disponibles
    fastify.get('/companies', { onRequest: [fastify.authenticate] }, async () => {
        return {
            data: Object.values(COMPANIES).map(c => ({
                code: c.code,
                name: c.name,
                currency: c.currency,
            })),
        };
    });

    // GET /api/admin/usage - Reporte de adopción/uso del CRM
    fastify.get('/usage', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { scopeLevel } = request.user as any;
            if (scopeLevel !== 'ALL') {
                return reply.code(403).send({ error: 'Solo administradores pueden ver el reporte de uso' });
            }

            const users = await prisma.user.findMany({
                where: { isActive: true },
                include: { role: true },
                orderBy: { lastLoginAt: 'desc' },
            });

            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 86400000);
            const monthAgo = new Date(now.getTime() - 30 * 86400000);

            const activeThisWeek = users.filter(u => u.lastLoginAt && u.lastLoginAt >= weekAgo).length;
            const activeThisMonth = users.filter(u => u.lastLoginAt && u.lastLoginAt >= monthAgo).length;
            const neverLoggedIn = users.filter(u => !u.lastLoginAt).length;

            return {
                summary: {
                    totalUsers: users.length,
                    activeThisWeek,
                    activeThisMonth,
                    neverLoggedIn,
                    adoptionRate: users.length > 0 ? Math.round((activeThisMonth / users.length) * 100) : 0,
                },
                users: users.map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`.trim(),
                    email: u.email,
                    role: u.role.name,
                    lastLoginAt: u.lastLoginAt?.toISOString() || null,
                    daysSinceLogin: u.lastLoginAt
                        ? Math.floor((now.getTime() - u.lastLoginAt.getTime()) / 86400000)
                        : null,
                    status: !u.lastLoginAt ? 'never' : u.lastLoginAt >= weekAgo ? 'active' : u.lastLoginAt >= monthAgo ? 'inactive' : 'dormant',
                })),
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener reporte de uso' });
        }
    });
}
