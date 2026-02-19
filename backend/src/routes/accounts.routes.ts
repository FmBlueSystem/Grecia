import { FastifyInstance } from 'fastify';
import { getAccounts, getAccountById, sapPost, PaginationParams } from '../services/sap-proxy.service';

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
            reply.code(500).send({ error: 'Failed to fetch accounts from SAP' });
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
                return reply.code(404).send({ error: 'Account not found' });
            }
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch account from SAP' });
        }
    });

    // C-6: POST /api/accounts — Create a BusinessPartner in SAP
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const body = request.body as {
                name: string;
                industry?: string;
                website?: string;
                phone?: string;
            };
            if (!body.name || !body.name.trim()) {
                return reply.code(400).send({ error: 'El nombre de la cuenta es requerido' });
            }

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
            const sapMsg = error.response?.data?.error?.message?.value;
            reply.code(error.response?.status || 500).send({
                error: sapMsg || 'Error al crear cuenta en SAP',
            });
        }
    });
}
