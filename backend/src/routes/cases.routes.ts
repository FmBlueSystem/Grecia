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
            const cases = await prisma.case.findMany({
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
