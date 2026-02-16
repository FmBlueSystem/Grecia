import { FastifyInstance } from 'fastify';
import { getContacts, PaginationParams } from '../services/sap-proxy.service';

export default async function contactRoutes(fastify: FastifyInstance) {
    // GET /api/contacts
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const query = request.query as Record<string, string>;
            const params: PaginationParams = {
                top: query.top ? Number(query.top) : 50,
                skip: query.skip ? Number(query.skip) : 0,
                search: query.search || undefined,
            };
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const result = await getContacts(request.companyCode, params,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch contacts from SAP' });
        }
    });
}
