import { FastifyInstance } from 'fastify';
import { getInvoices, getInvoiceById, PaginationParams } from '../services/sap-proxy.service';

export default async function invoiceRoutes(fastify: FastifyInstance) {
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
            reply.code(500).send({ error: 'Failed to fetch invoices from SAP' });
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
                return reply.code(404).send({ error: 'Invoice not found' });
            }
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch invoice from SAP' });
        }
    });
}
