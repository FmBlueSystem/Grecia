import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Zod Schemas
const activitySchema = z.object({
    activityType: z.string().min(1),
    subject: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string().or(z.date()).optional(),
    status: z.string().default('Planned'),
    priority: z.string().default('Normal'),
    contactId: z.string().optional(),
    opportunityId: z.string().optional(),
    ownerId: z.string().min(1),
    isCompleted: z.boolean().default(false),
});

export default async function activityRoutes(fastify: FastifyInstance) {

    // GET /api/activities
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const activities = await prisma.activity.findMany({
                orderBy: { dueDate: 'asc' },
                include: {
                    contact: { select: { firstName: true, lastName: true } },
                    opportunity: { select: { name: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } }
                }
            });
            return { data: activities, total: activities.length };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch activities' });
        }
    });

    // GET /api/activities/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const activity = await prisma.activity.findUnique({
                where: { id },
                include: {
                    contact: { select: { firstName: true, lastName: true } },
                    opportunity: { select: { name: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } }
                }
            });

            if (!activity) {
                return reply.code(404).send({ error: 'Activity not found' });
            }
            return { data: activity };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch activity' });
        }
    });

    // POST /api/activities
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = activitySchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        const { dueDate, ...rest } = result.data;
        const finalDueDate = dueDate ? new Date(dueDate) : undefined;

        try {
            // Ensure contact/opp exist if provided? Prisma will throw if foreign key fails.
            // We can just try to create.

            const newActivity = await prisma.activity.create({
                data: {
                    ...rest,
                    dueDate: finalDueDate,
                }
            });
            return { data: newActivity };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create activity' });
        }
    });

    // PUT /api/activities/:id
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const result = activitySchema.partial().safeParse(request.body);

        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        try {
            const { dueDate, ...rest } = result.data;
            const updateData: any = { ...rest };
            if (dueDate) {
                updateData.dueDate = new Date(dueDate);
            }

            const updated = await prisma.activity.update({
                where: { id },
                data: updateData
            });
            return { data: updated };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to update activity' });
        }
    });

    // DELETE /api/activities/:id
    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.activity.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to delete activity' });
        }
    });
}
