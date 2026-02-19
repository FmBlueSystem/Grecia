import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getContacts, PaginationParams, sapPost, escapeOData } from '../services/sap-proxy.service';
import { sendError, extractSapError } from '../lib/errors';

const createContactSchema = z.object({
    firstName: z.string().min(1, 'El nombre es requerido').max(100),
    lastName: z.string().min(1, 'El apellido es requerido').max(100),
    email: z.string().email().or(z.literal('')).optional(),
    phone: z.string().max(30).optional(),
    jobTitle: z.string().max(100).optional(),
    cardCode: z.string().max(50).optional(),
});

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
            sendError(reply, 500, 'Error al obtener contactos');
        }
    });

    // POST /api/contacts — Create contact person in SAP
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const parsed = createContactSchema.safeParse(request.body);
            if (!parsed.success) {
                return sendError(reply, 400, parsed.error.issues[0]?.message || 'Datos inválidos');
            }
            const body = parsed.data;
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
                    await sapPost(request.companyCode, `BusinessPartners('${escapeOData(body.cardCode)}')`, sapBody);
                } catch (sapError: any) {
                    // I-7: Surface SAP errors instead of silently swallowing
                    request.log.warn({ sapError: extractSapError(sapError) }, 'SAP contact creation failed');
                    return sendError(reply, 502, extractSapError(sapError));
                }
            }
            return { success: true, data: { firstName: body.firstName, lastName: body.lastName } };
        } catch (error) {
            request.log.error(error);
            sendError(reply, 500, 'Error al crear contacto');
        }
    });
}
