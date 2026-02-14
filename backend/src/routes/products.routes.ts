import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const productSchema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().min(0),
    currency: z.string().default('USD'),
    stockLevel: z.number().int().default(0),
    isActive: z.boolean().default(true),
});

export default async function productRoutes(fastify: FastifyInstance) {

    // GET /api/products
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const products = await prisma.product.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            });
            return { data: products, total: products.length };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch products' });
        }
    });

    // POST /api/products
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = productSchema.safeParse(request.body);
        if (!result.success) return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });

        try {
            const product = await prisma.product.create({
                data: result.data
            });
            return { data: product };
        } catch (error) {
            // Check unique constraint on code
            reply.code(500).send({ error: 'Failed to create product' });
        }
    });
}
