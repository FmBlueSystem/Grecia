import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const orderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    discount: z.number().optional().default(0),
});

const orderSchema = z.object({
    orderNumber: z.string().min(1),
    sapOrderId: z.string().optional(),
    accountId: z.string().min(1),
    contactId: z.string().optional(),
    opportunityId: z.string().optional(),
    status: z.string().default('PENDING'),
    logisticsStatus: z.string().optional(),
    trackingNumber: z.string().optional(),
    items: z.array(orderItemSchema).optional(),
    ownerId: z.string().min(1),
});

export default async function orderRoutes(fastify: FastifyInstance) {

    // GET /api/orders
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const orders = await prisma.order.findMany({
                orderBy: { updatedAt: 'desc' },
                include: {
                    account: { select: { name: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } }
                }
            });
            return { data: orders, total: orders.length };
        } catch (error) {
            reply.code(500).send({ error: 'Failed to fetch orders' });
        }
    });

    // GET /api/orders/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const order = await prisma.order.findUnique({
                where: { id },
                include: {
                    items: { include: { product: true } },
                    account: true
                }
            });
            if (!order) return reply.code(404).send({ error: 'Order not found' });
            return { data: order };
        } catch (error) {
            reply.code(500).send({ error: 'Failed to fetch order' });
        }
    });

    // POST /api/orders
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = orderSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });

        const { items, ...rest } = result.data;

        try {
            // Calculate totals
            let totalAmount = 0;
            if (items) {
                totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (1 - item.discount / 100)), 0);
            }

            const newOrder = await prisma.order.create({
                data: {
                    ...rest,
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
            return { data: newOrder };

        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create order' });
        }
    });

    // PUT /api/orders/:id/logistics
    fastify.put('/:id/logistics', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const body = request.body as { status?: string, logisticsStatus?: string, trackingNumber?: string };

        try {
            const updated = await prisma.order.update({
                where: { id },
                data: {
                    ...(body.status && { status: body.status }),
                    ...(body.logisticsStatus && { logisticsStatus: body.logisticsStatus }),
                    ...(body.trackingNumber && { trackingNumber: body.trackingNumber }),
                }
            });
            return { data: updated };
        } catch (error) {
            reply.code(500).send({ error: 'Failed to update order logistics' });
        }
    });
}
