import { FastifyInstance } from 'fastify';
import { getDashboardStats, getMyDay } from '../services/sap-proxy.service';

export default async function dashboardRoutes(fastify: FastifyInstance) {
    // GET /api/dashboard/stats?months=6
    fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const { months } = request.query as { months?: string };
            const monthsNum = months ? parseInt(months, 10) : 6;
            const stats = await getDashboardStats(request.companyCode,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode,
                monthsNum
            );
            return stats;
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch dashboard stats from SAP' });
        }
    });

    // GET /api/dashboard/my-day
    fastify.get('/my-day', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const data = await getMyDay(request.companyCode,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return data;
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch my-day data from SAP' });
        }
    });
}
