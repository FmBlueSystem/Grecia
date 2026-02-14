import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Zod Schema for Account
const accountSchema = z.object({
    name: z.string().min(1),
    industry: z.string().optional(),
    accountType: z.string().optional(), // 'Customer', 'Partner', 'Prospect'
    website: z.string().url().optional().or(z.literal('')),
    phone: z.string().optional(),
    sapId: z.string().optional(),
    ownerId: z.string().min(1),
    isActive: z.boolean().default(true),
});

export default async function accountRoutes(fastify: FastifyInstance) {
    // GET /api/accounts
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const accounts = await prisma.account.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true } },
                    _count: { select: { contacts: true, opportunities: true } }
                }
            });
            return { data: accounts, total: accounts.length };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch accounts' });
        }
    });

    // GET /api/accounts/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const account = await prisma.account.findUnique({
                where: { id },
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true } },
                    contacts: true,
                    opportunities: true
                }
            });

            if (!account) {
                return reply.code(404).send({ error: 'Account not found' });
            }

            return { data: account };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch account' });
        }
    });

    // POST /api/accounts
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = accountSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        try {
            const newAccount = await prisma.account.create({
                data: result.data
            });
            return { data: newAccount };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create account' });
        }
    });

    // PUT /api/accounts/:id
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const result = accountSchema.partial().safeParse(request.body);

        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        try {
            const updatedAccount = await prisma.account.update({
                where: { id },
                data: result.data
            });
            return { data: updatedAccount };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to update account' });
        }
    });

    // DELETE /api/accounts/:id
    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.account.update({
                where: { id },
                data: { isActive: false }
            });
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to delete account' });
        }
    });
}
