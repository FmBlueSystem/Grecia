import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Zod Schemas
const opportunitySchema = z.object({
    name: z.string().min(1),
    amount: z.number().min(0),
    currency: z.string().default('USD'),
    stage: z.string().min(1),
    probability: z.number().min(0).max(100),
    closeDate: z.string().or(z.date()), // Receive string from JSON, convert to Date
    accountName: z.string().min(1),
    contactName: z.string().optional(),
    ownerId: z.string().min(1),
});

export default async function opportunityRoutes(fastify: FastifyInstance) {

    // GET /api/opportunities
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const opportunities = await prisma.opportunity.findMany({
                where: { isClosed: false }, // Default filter, maybe? Or all? Let's return all for MVP list usually. All active.
                // Actually, let's just return all for the table, maybe sort by updatedAt
                orderBy: { updatedAt: 'desc' },
                include: {
                    account: { select: { name: true } },
                    contact: { select: { firstName: true, lastName: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } }
                }
            });

            // Transform for frontend
            const data = opportunities.map(opp => ({
                ...opp,
                accountName: opp.account.name,
                contactName: opp.contact ? `${opp.contact.firstName} ${opp.contact.lastName}` : '',
                // Format date string if needed, but Date object is usually fine for JSON serialization (ISO string)
            }));

            return { data, total: data.length };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch opportunities' });
        }
    });

    // GET /api/opportunities/:id
    fastify.get('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const opp = await prisma.opportunity.findUnique({
                where: { id },
                include: {
                    account: { select: { name: true } },
                    contact: { select: { firstName: true, lastName: true } },
                    owner: { select: { id: true, firstName: true, lastName: true } }
                }
            });

            if (!opp) {
                return reply.code(404).send({ error: 'Opportunity not found' });
            }

            const data = {
                ...opp,
                accountName: opp.account.name,
                contactName: opp.contact ? `${opp.contact.firstName} ${opp.contact.lastName}` : '',
            };

            return { data };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch opportunity' });
        }
    });

    // POST /api/opportunities
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const result = opportunitySchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        const { accountName, contactName, closeDate, ...rest } = result.data;
        const finalCloseDate = new Date(closeDate);

        try {
            // 1. Resolve Account (Upsert)
            // 1. Resolve Account (Find or Create)
            let accountId: string;
            const existingAccount = await prisma.account.findFirst({
                where: { name: accountName }
            });

            if (existingAccount) {
                accountId = existingAccount.id;
            } else {
                const newAccount = await prisma.account.create({
                    data: {
                        name: accountName,
                        ownerId: rest.ownerId,
                    }
                });
                accountId = newAccount.id;
            }

            // 2. Resolve Contact (Optional)
            let contactId: string | null = null;
            if (contactName) {
                // Try to split name first last
                // Very basic simple strategy
                const parts = contactName.trim().split(' ');
                if (parts.length > 0) {
                    const firstName = parts[0];
                    const lastName = parts.slice(1).join(' ');

                    // Try to find
                    const contact = await prisma.contact.findFirst({
                        where: {
                            firstName: { contains: firstName, mode: 'insensitive' },
                            lastName: { contains: lastName, mode: 'insensitive' }
                        }
                    });
                    if (contact) {
                        contactId = contact.id;
                    }
                }
            }

            // 3. Create Opportunity
            const newOpp = await prisma.opportunity.create({
                data: {
                    ...rest,
                    closeDate: finalCloseDate,
                    accountId,
                    contactId,
                    stage: rest.stage, // Explicitly Ensure stage is string
                }
            });

            return { data: newOpp };

        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to create opportunity' });
        }
    });

    // PUT /api/opportunities/:id
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const result = opportunitySchema.partial().safeParse(request.body);

        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input', details: result.error.issues });
        }

        try {
            const { accountName, contactName, closeDate, ...rest } = result.data;

            const updateData: any = { ...rest };

            if (closeDate) {
                updateData.closeDate = new Date(closeDate);
            }

            // Handle Relation Updates if names provided
            if (accountName) {
                let accountId: string;
                const existingAccount = await prisma.account.findFirst({ where: { name: accountName } });
                if (existingAccount) {
                    accountId = existingAccount.id;
                } else {
                    // If checking for existing account, we likely need ownerId. 
                    // If it's a partial update, we might not have ownerId in body.
                    // We should fetch current opp to get ownerId fallback or just use current user? 
                    // Let's fetch current opp first.
                    const currentOpp = await prisma.opportunity.findUnique({ where: { id } });
                    if (!currentOpp) return reply.code(404).send({ error: 'Not found' });

                    const newAccount = await prisma.account.create({
                        data: {
                            name: accountName,
                            ownerId: currentOpp.ownerId,
                        }
                    });
                    accountId = newAccount.id;
                }
                updateData.accountId = accountId;
            }

            if (contactName !== undefined) {
                // Logic to update contact if changed.
                // If empty string, maybe disconnect?
                if (contactName === '') {
                    updateData.contactId = null;
                } else {
                    // Try resolve
                    const parts = contactName.trim().split(' ');
                    if (parts.length > 0) {
                        const firstName = parts[0];
                        const lastName = parts.slice(1).join(' ');
                        const contact = await prisma.contact.findFirst({
                            where: {
                                firstName: { contains: firstName, mode: 'insensitive' },
                                lastName: { contains: lastName, mode: 'insensitive' }
                            }
                        });
                        if (contact) {
                            updateData.contactId = contact.id;
                        }
                        // If not found, ignore? or create? For now ignore.
                    }
                }
            }

            const updated = await prisma.opportunity.update({
                where: { id },
                data: updateData
            });

            // Automation: Stage 10 (Closed Won) -> Create Order
            // Check if stage changed to CLOSED_WON
            if (updateData.stage === 'CLOSED_WON') {
                // Import dynamically to avoid circular deps if any, or just call service
                const { createOrderFromOpportunity } = await import('../services/orders.service');
                // We need companyCode from request context
                await createOrderFromOpportunity(id, request.companyCode);
            }

            return { data: updated };

        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to update opportunity' });
        }
    });

    // DELETE /api/opportunities/:id
    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            // Hard delete or soft? Schema has `isClosed` but not `isActive` / `deleted`.
            // We can just delete it for now or check if schema supports soft delete.
            // Checking schema... Opportunity has `isClosed`, `isWon`. No `isDeleted`.
            // Let's do hard delete for now to be clean.
            await prisma.opportunity.delete({ where: { id } });
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to delete opportunity' });
        }
    });
}
