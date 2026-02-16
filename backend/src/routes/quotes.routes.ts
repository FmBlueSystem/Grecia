import { FastifyInstance } from 'fastify';
import { getQuotes, getQuoteById, PaginationParams, sapPost, CountryCode } from '../services/sap-proxy.service';

export default async function quoteRoutes(fastify: FastifyInstance) {
    // GET /api/quotes
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
            const result = await getQuotes(request.companyCode, params,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch quotes from SAP' });
        }
    });

    // POST /api/quotes - Crear cotización en SAP
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const cc = request.companyCode as CountryCode;
            const body = request.body as {
                cardCode: string;
                docDueDate: string;
                salesPersonCode?: number;
                comments?: string;
                lines: { itemCode: string; quantity: number; unitPrice?: number; discount?: number }[];
            };

            if (!body.cardCode || !body.lines?.length) {
                return reply.code(400).send({ error: 'Se requiere cardCode y al menos una línea' });
            }

            const sapBody: any = {
                CardCode: body.cardCode,
                DocDueDate: body.docDueDate || new Date().toISOString().split('T')[0],
                Comments: body.comments || '',
                DocumentLines: body.lines.map((line, i) => ({
                    LineNum: i,
                    ItemCode: line.itemCode,
                    Quantity: line.quantity,
                    ...(line.unitPrice != null ? { UnitPrice: line.unitPrice } : {}),
                    ...(line.discount != null ? { DiscountPercent: line.discount } : {}),
                })),
            };

            if (body.salesPersonCode != null) {
                sapBody.SalesPersonCode = body.salesPersonCode;
            } else {
                const { sapSalesPersonCode } = request.user as any;
                if (sapSalesPersonCode) sapBody.SalesPersonCode = sapSalesPersonCode;
            }

            const result = await sapPost(cc, 'Quotations', sapBody);
            return reply.code(201).send({
                success: true,
                docEntry: result.DocEntry,
                docNum: result.DocNum,
            });
        } catch (error: any) {
            request.log.error(error);
            const sapMsg = error.response?.data?.error?.message?.value;
            reply.code(500).send({ error: sapMsg || 'Error al crear cotización en SAP' });
        }
    });

    // GET /api/quotes/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const quote = await getQuoteById(request.companyCode, id);
            return { data: quote };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return reply.code(404).send({ error: 'Quote not found' });
            }
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch quote from SAP' });
        }
    });
}
