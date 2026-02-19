import { FastifyInstance } from 'fastify';
import { getOrders, getOrderById, PaginationParams } from '../services/sap-proxy.service';
import { sendError } from '../lib/errors';

export default async function orderRoutes(fastify: FastifyInstance) {
    // GET /api/orders
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const query = request.query as Record<string, string>;
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const params: PaginationParams = {
                top: query.top ? Number(query.top) : 50,
                skip: query.skip ? Number(query.skip) : 0,
                filter: query.filter || undefined,
                orderBy: query.orderBy || 'DocDate desc',
            };
            const result = await getOrders(request.companyCode, params,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener pedidos');
        }
    });

    // GET /api/orders/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const order = await getOrderById(request.companyCode, id);
            return { data: order };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return sendError(reply, 404, 'Pedido no encontrado');
            }
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener pedido');
        }
    });
}
