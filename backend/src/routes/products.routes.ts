import { FastifyInstance } from 'fastify';
import { getProducts, PaginationParams } from '../services/sap-proxy.service';

export default async function productRoutes(fastify: FastifyInstance) {
    // GET /api/products
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const query = request.query as Record<string, string>;
            const params: PaginationParams = {
                top: query.top ? Number(query.top) : 50,
                skip: query.skip ? Number(query.skip) : 0,
                search: query.search || undefined,
            };
            const result = await getProducts(request.companyCode, params);
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch products from SAP' });
        }
    });
}
