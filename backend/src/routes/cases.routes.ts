import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const caseSchema = z.object({
    title: z.string().min(1),
    caseNumber: z.string().min(1),
    description: z.string().optional(),
    priority: z.string().default('NORMAL'),
    status: z.string().default('NEW'),
    origin: z.string().optional(),
    accountId: z.string().optional(),
    contactId: z.string().optional(),
    ownerId: z.string().min(1),
});

export default async function caseRoutes(fastify: FastifyInstance) {

    // GET /api/cases
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id: userId, scopeLevel } = request.user as any;
            const cases = await prisma.case.findMany({
                where: {
                    ...(scopeLevel === 'OWN' && { ownerId: userId }),
                },
                orderBy: { updatedAt: 'desc' },
                include: {
                    account: { select: { name: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } }
                }
            });
            return { data: cases, total: cases.length };
        } catch (error) {
            reply.code(500).send({ error: 'Failed to fetch cases' });
        }
    });

    // GET /api/cases/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const caseItem = await prisma.case.findUnique({
                where: { id },
                include: {
                    account: { select: { id: true, name: true } },
                    contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, jobTitle: true } },
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            });
            if (!caseItem) return reply.code(404).send({ error: 'Case not found' });
            return { data: caseItem };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch case' });
        }
    });

    // PUT /api/cases/:id
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as Record<string, any>;
            const allowedFields = ['title', 'description', 'priority', 'status', 'origin', 'accountId', 'contactId', 'ownerId'];
            const data: Record<string, any> = {};
            for (const key of allowedFields) {
                if (body[key] !== undefined) data[key] = body[key];
            }
            if (Object.keys(data).length === 0) {
                return reply.code(400).send({ error: 'No fields to update' });
            }
            const updated = await prisma.case.update({
                where: { id },
                data,
                include: {
                    account: { select: { id: true, name: true } },
                    contact: { select: { id: true, firstName: true, lastName: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            return { data: updated };
        } catch (error: any) {
            if (error?.code === 'P2025') return reply.code(404).send({ error: 'Case not found' });
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to update case' });
        }
    });

    // POST /api/cases
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = caseSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });

        try {
            const newCase = await prisma.case.create({
                data: result.data
            });
            return { data: newCase };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create case' });
        }
    });
}
