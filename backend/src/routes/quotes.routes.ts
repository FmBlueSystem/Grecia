import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const quoteItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    discount: z.number().optional().default(0),
});

const quoteSchema = z.object({
    name: z.string().min(1),
    quoteNumber: z.string().min(1),
    expirationDate: z.string().optional(), // ISO String
    accountId: z.string().min(1),
    contactId: z.string().optional(),
    opportunityId: z.string().optional(),
    status: z.string().default('DRAFT'),
    items: z.array(quoteItemSchema).optional(),
    ownerId: z.string().min(1),
});

export default async function quoteRoutes(fastify: FastifyInstance) {

    // GET /api/quotes
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const quotes = await prisma.quote.findMany({
                orderBy: { updatedAt: 'desc' },
                include: {
                    account: { select: { name: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } }
                }
            });
            return { data: quotes, total: quotes.length };
        } catch (error) {
            reply.code(500).send({ error: 'Failed to fetch quotes' });
        }
    });

    // GET /api/quotes/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const quote = await prisma.quote.findUnique({
                where: { id },
                include: {
                    items: {
                        include: { product: true }
                    },
                    account: true,
                    contact: true
                }
            });
            if (!quote) return reply.code(404).send({ error: 'Quote not found' });
            return { data: quote };
        } catch (error) {
            reply.code(500).send({ error: 'Failed to fetch quote' });
        }
    });

    // POST /api/quotes
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = quoteSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });

        const { items, expirationDate, ...rest } = result.data;

        try {
            // Calculate totals
            let totalAmount = 0;
            if (items) {
                totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - item.discount / 100)), 0);
            }

            const newQuote = await prisma.quote.create({
                data: {
                    ...rest,
                    expirationDate: expirationDate ? new Date(expirationDate) : null,
                    totalAmount,
                    items: {
                        create: items?.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice * (1 - item.discount / 100),
                            discount: item.discount
                        }))
                    }
                },
                include: { items: true }
            });
            return { data: newQuote };

        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create quote' });
        }
    });
}
