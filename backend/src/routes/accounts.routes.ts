import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getAccounts, getAccountById, sapPost, PaginationParams } from '../services/sap-proxy.service';
import { sendError, extractSapError, sapErrorCode } from '../lib/errors';

const createAccountSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(200),
    industry: z.string().max(100).optional(),
    website: z.string().url().or(z.literal('')).optional(),
    phone: z.string().max(30).optional(),
});

export default async function accountRoutes(fastify: FastifyInstance) {
    // GET /api/accounts
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const query = request.query as Record<string, string>;
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const params: PaginationParams = {
                top: query.top ? Number(query.top) : 50,
                skip: query.skip ? Number(query.skip) : 0,
                search: query.search || undefined,
                orderBy: query.orderBy || 'CardName asc',
            };
            const result = await getAccounts(request.companyCode, params,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener cuentas');
        }
    });

    // GET /api/accounts/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const account = await getAccountById(request.companyCode, id);
            return { data: account };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return sendError(reply, 404, 'Cuenta no encontrada');
            }
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener cuenta');
        }
    });

    // C-6: POST /api/accounts — Create a BusinessPartner in SAP
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const parsed = createAccountSchema.safeParse(request.body);
            if (!parsed.success) {
                return sendError(reply, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
            }
            const body = parsed.data;

            const { sapSalesPersonCode } = request.user as any;
            const sapBody: Record<string, any> = {
                CardName: body.name.trim(),
                CardType: 'cCustomer',
            };
            if (body.phone) sapBody.Phone1 = body.phone;
            if (body.website) sapBody.Website = body.website;
            if (body.industry) sapBody.Notes = `Industria: ${body.industry}`;
            if (sapSalesPersonCode != null) sapBody.SalesPersonCode = sapSalesPersonCode;

            const result = await sapPost(request.companyCode, 'BusinessPartners', sapBody);
            return { success: true, data: { id: result.CardCode, name: result.CardName } };
        } catch (error: any) {
            request.log.error(error);
            sendError(reply, sapErrorCode(error), extractSapError(error));
        }
    });
}
