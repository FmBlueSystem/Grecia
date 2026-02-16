import { FastifyInstance } from 'fastify';
import { getActivities, PaginationParams } from '../services/sap-proxy.service';

export default async function activityRoutes(fastify: FastifyInstance) {
    // GET /api/activities
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const query = request.query as Record<string, string>;
            const params: PaginationParams = {
                top: query.top ? Number(query.top) : 50,
                skip: query.skip ? Number(query.skip) : 0,
                filter: query.filter || undefined,
                orderBy: query.orderBy || 'StartDate desc',
            };
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const result = await getActivities(request.companyCode, params,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch activities from SAP' });
        }
    });
}
