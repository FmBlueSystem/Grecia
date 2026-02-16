import { FastifyInstance } from 'fastify';
import { getDashboardStats } from '../services/sap-proxy.service';

export default async function dashboardRoutes(fastify: FastifyInstance) {
    // GET /api/dashboard/stats
    fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const stats = await getDashboardStats(request.companyCode,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return stats;
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch dashboard stats from SAP' });
        }
    });
}
