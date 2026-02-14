import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const invoiceSchema = z.object({
    invoiceNumber: z.string().min(1),
    sapInvoiceId: z.string().optional(),
    amount: z.number().min(0),
    status: z.string().default('UNPAID'),
    dueDate: z.string(), // ISO String
    accountId: z.string().min(1),
});

export default async function invoiceRoutes(fastify: FastifyInstance) {

    // GET /api/invoices
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const invoices = await prisma.invoice.findMany({
                orderBy: { updatedAt: 'desc' },
                include: {
                    account: { select: { name: true } }
                }
            });
            return { data: invoices, total: invoices.length };
        } catch (error) {
            console.error('ERROR in GET /api/invoices:', error);
            reply.code(500).send({ error: 'Failed to fetch invoices' });
        }
    });

    // GET /api/invoices/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const invoice = await prisma.invoice.findUnique({
                where: { id }
            });
            if (!invoice) return reply.code(404).send({ error: 'Invoice not found' });
            return { data: invoice };
        } catch (error) {
            reply.code(500).send({ error: 'Failed to fetch invoice' });
        }
    });

    // POST /api/invoices
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = invoiceSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });

        const { dueDate, ...rest } = result.data;

        try {
            const newInvoice = await prisma.invoice.create({
                data: {
                    ...rest,
                    dueDate: new Date(dueDate),
                }
            });
            return { data: newInvoice };

        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create invoice' });
        }
    });
}
