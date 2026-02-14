import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Zod Schemas
const contactSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    jobTitle: z.string().optional(),
    company: z.string().optional(),
    leadSource: z.string().optional(),
    tags: z.array(z.string()).optional(),
    ownerId: z.string().min(1),
});

export default async function contactRoutes(fastify: FastifyInstance) {
    // GET /api/contacts
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const contacts = await prisma.contact.findMany({
                where: { isActive: true },
                orderBy: { updatedAt: 'desc' },
                include: { owner: { select: { id: true, firstName: true, lastName: true } } }
            });
            return { data: contacts, total: contacts.length };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch contacts' });
        }
    });

    // GET /api/contacts/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const contact = await prisma.contact.findUnique({
                where: { id },
                include: { owner: { select: { id: true, firstName: true, lastName: true } } }
            });

            if (!contact) {
                return reply.code(404).send({ error: 'Contact not found' });
            }

            return { data: contact };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch contact' });
        }
    });

    // POST /api/contacts
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = contactSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        try {
            // Check if owner exists
            const ownerExists = await prisma.user.findUnique({ where: { id: result.data.ownerId } });
            if (!ownerExists) {
                // Fallback: if user doesn't exist (maybe seed data issue), default to the default user or error?
                // Ideally error. For now, strict.
                return reply.code(400).send({ error: 'Owner user not found' });
            }

            const newContact = await prisma.contact.create({
                data: {
                    firstName: result.data.firstName,
                    lastName: result.data.lastName,
                    email: result.data.email || null,
                    phone: result.data.phone,
                    mobile: result.data.mobile,
                    jobTitle: result.data.jobTitle,
                    // company: result.data.company (Note: Prisma schema maps Contact.accountId, not company string. Need to fix or adapt)
                    // The current Prisma schema has `accountId` relation, but the FE sends `company` string.
                    // For MVP transition, we might ignore company string if account doesn't exist, or create Account.
                    // Let's stick to the schema: strictly requires accountId if we want to link account.
                    // But the Zod schema above had `company` string.
                    // Looking at `db.ts`, it had `company` string on the interface.
                    // Looking at phase 0, we verify prisma schema.
                    // Prisma schema: `accountId String?` and `account Account?`. No `company` string field on Contact.
                    // We will omit `company` for now or map it if we had logic. simpler to omit.
                    leadSource: result.data.leadSource,
                    tags: result.data.tags || [],
                    ownerId: result.data.ownerId,
                }
            });
            return { data: newContact };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create contact' });
        }
    });

    // PUT /api/contacts/:id
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        // Allow partial updates
        const partialSchema = contactSchema.partial();
        const result = partialSchema.safeParse(request.body);

        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        try {
            const updatedContact = await prisma.contact.update({
                where: { id },
                data: {
                    ...result.data,
                    // Handle explicit nulls for optional fields if needed, currently safeParse removes undefineds
                }
            });
            return { data: updatedContact };
        } catch (error) {
            request.log.error(error);
            // Prisma error P2025 = Record not found
            reply.code(500).send({ error: 'Failed to update contact' });
        }
    });

    // DELETE /api/contacts/:id
    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            // Soft delete
            await prisma.contact.update({
                where: { id },
                data: { isActive: false }
            });
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to delete contact' });
        }
    });
}
