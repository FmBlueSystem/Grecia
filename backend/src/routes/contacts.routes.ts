import { FastifyInstance } from 'fastify';
import { getContacts, PaginationParams, sapPost } from '../services/sap-proxy.service';

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

    // POST /api/contacts — Create contact person in SAP
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const body = request.body as {
                firstName: string;
                lastName: string;
                email?: string;
                phone?: string;
                jobTitle?: string;
                cardCode?: string;
            };
            if (!body.firstName || !body.lastName) {
                return reply.code(400).send({ error: 'firstName and lastName are required' });
            }
            // SAP ContactPersons are linked to a BusinessPartner via CardCode
            // If no cardCode, we create the contact in our local DB only
            if (body.cardCode) {
                const sapBody = {
                    CardCode: body.cardCode,
                    ContactEmployees: [{
                        Name: `${body.firstName} ${body.lastName}`,
                        FirstName: body.firstName,
                        LastName: body.lastName,
                        E_Mail: body.email || '',
                        Phone1: body.phone || '',
                        Title: body.jobTitle || '',
                    }],
                };
                try {
                    await sapPost(request.companyCode, `BusinessPartners('${body.cardCode.replace(/'/g, "''")}')`, sapBody);
                } catch (sapError: any) {
                    // I-7: Surface SAP errors instead of silently swallowing
                    const sapMsg = sapError.response?.data?.error?.message?.value;
                    request.log.warn({ sapError: sapMsg }, 'SAP contact creation failed');
                    return reply.code(502).send({
                        error: sapMsg || 'Error al crear contacto en SAP',
                        partial: true,
                    });
                }
            }
            return { success: true, data: { firstName: body.firstName, lastName: body.lastName } };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create contact' });
        }
    });
}
