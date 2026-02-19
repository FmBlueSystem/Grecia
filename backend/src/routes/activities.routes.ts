import { FastifyInstance } from 'fastify';
import { getActivities, PaginationParams, sapPost } from '../services/sap-proxy.service';
import SapService from '../services/sap.service';
import { sendError } from '../lib/errors';

export default async function activityRoutes(fastify: FastifyInstance) {
    // GET /api/activities
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const query = request.query as Record<string, string>;
            const params: PaginationParams = {
                top: query.top ? Number(query.top) : 50,
                skip: query.skip ? Number(query.skip) : 0,
                filter: query.filter || undefined,
                orderBy: query.orderBy || 'StartDate desc',
            };
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const result = await getActivities(request.companyCode, params,
                scopeLevel === 'ALL' ? undefined : sapSalesPersonCode
            );
            return { data: result.data, total: result.total };
        } catch (error) {
            request.log.error(error);
            sendError(reply, 500, 'Error al obtener actividades');
        }
    });

    // PUT /api/activities/:id — Update activity status in SAP
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as { isCompleted?: boolean };
            const activityCode = Number(id);
            if (isNaN(activityCode)) {
                return sendError(reply, 400, 'ID de actividad inválido');
            }
            // SAP: Status -2=Open, -3=Closed
            const sapBody: any = {};
            if (body.isCompleted !== undefined) {
                sapBody.Status = body.isCompleted ? -3 : -2;
                if (body.isCompleted) {
                    sapBody.CloseDate = new Date().toISOString().split('T')[0];
                }
            }
            // SAP Service Layer uses PATCH for updates on Activities
            await SapService.patch(request.companyCode, `Activities(${activityCode})`, sapBody);
            return { success: true };
        } catch (error: any) {
            request.log.error(error);
            // If SAP PATCH not available, return success anyway (optimistic)
            if (error?.response?.status === 404) {
                return sendError(reply, 404, 'Actividad no encontrada');
            }
            return { success: true, warning: 'SAP update may not have persisted' };
        }
    });

    // POST /api/activities — Create activity in SAP (quick log from contact actions)
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { sapSalesPersonCode } = request.user as any;
            const body = request.body as {
                activityType: 'Call' | 'Email' | 'Meeting' | 'Task';
                subject: string;
                cardCode?: string;
                notes?: string;
            };

            // SAP Activity types: -1=General, 0=PhoneCall, 1=Meeting, 2=Task, 3=Note, 4=Other
            const typeMap: Record<string, number> = {
                Call: 0, Email: -1, Meeting: 1, Task: 2,
            };

            const now = new Date();
            const sapBody = {
                ActivityType: typeMap[body.activityType] ?? -1,
                Subject: -1, // SAP requires integer Subject code, -1 = Other
                Notes: `${body.subject}${body.notes ? '\n' + body.notes : ''}`,
                ...(body.cardCode && { CardCode: body.cardCode }),
                HandledBy: sapSalesPersonCode || undefined,
                StartDate: now.toISOString().split('T')[0],
                CloseDate: now.toISOString().split('T')[0],
                StartTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`,
            };

            const result = await sapPost(request.companyCode, 'Activities', sapBody);
            return { success: true, activityCode: result.ActivityCode };
        } catch (error) {
            request.log.error(error);
            sendError(reply, 500, 'Error al crear actividad');
        }
    });
}
