import { FastifyInstance } from 'fastify';
import { getInvoices, getInvoiceById, getInvoiceStats, PaginationParams } from '../services/sap-proxy.service';
import { sendError } from '../lib/errors';

export default async function invoiceRoutes(fastify: FastifyInstance) {
    // GET /api/invoices/stats — Aggregated stats over full dataset
    fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            return await getInvoiceStats(request.companyCode,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
        } catch (error) {
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener estadísticas de facturas');
        }
    });

    // GET /api/invoices
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
            const result = await getInvoices(request.companyCode, params,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener facturas');
        }
    });

    // GET /api/invoices/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const invoice = await getInvoiceById(request.companyCode, id);
            return { data: invoice };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return sendError(reply, 404, 'Factura no encontrada');
            }
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener factura');
        }
    });
}
