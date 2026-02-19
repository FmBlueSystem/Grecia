import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';

const leadSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    source: z.string().optional(),
    // BANT & Details
    jobTitle: z.string().optional(),
    industry: z.string().optional(),
    need: z.string().optional(),
    budget: z.number().optional(),
    timeframe: z.string().optional(),
    authority: z.boolean().optional(),
    notes: z.string().optional(),
});

const leadsRoutes: FastifyPluginAsync = async (fastify) => {

    // GET /api/leads
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id: userId, scopeLevel } = request.user as any;
            const leads = await prisma.lead.findMany({
                where: {
                    status: { not: 'CONVERTED' },
                    ...(scopeLevel === 'OWN' && { ownerId: userId }),
                },
                orderBy: { createdAt: 'desc' },
                include: { owner: { select: { firstName: true, lastName: true } } }
            });
            return { data: leads };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener prospectos' });
        }
    });

    // POST /api/leads
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const result = leadSchema.safeParse(request.body);
            if (!result.success) {
                return reply.status(400).send({ error: result.error });
            }

            const ownerId = (request.user as any)?.id;

            const newLead = await prisma.lead.create({
                data: {
                    ...result.data,
                    ownerId: ownerId,
                    status: 'NEW',
                    isAssigned: !!ownerId,
                    assignedAt: ownerId ? new Date() : null
                }
            });
            return { data: newLead };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al crear prospecto' });
        }
    });

    // POST /api/leads/:id/qualify (Stage 6 Conversion)
    fastify.post('/:id/qualify', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const body = request.body as { createAccount: boolean, createContact: boolean, createOpportunity: boolean };

            const lead = await prisma.lead.findUnique({ where: { id } });
            if (!lead) return reply.status(404).send({ error: "Lead not found" });

            // Transaction for Atomic Conversion
            const result = await prisma.$transaction(async (tx) => {
                let accountId = lead.convertedAccountId;
                let contactId = lead.convertedContactId;
                let opportunityId = lead.convertedOpportunityId;

                // 1. Create Account
                if (body.createAccount && !accountId && lead.company) {
                    const account = await tx.account.create({
                        data: {
                            name: lead.company,
                            phone: lead.phone,
                            industry: lead.industry,
                            ownerId: lead.ownerId,
                        }
                    });
                    accountId = account.id;
                }

                // 2. Create Contact
                if (body.createContact && !contactId) {
                    const contact = await tx.contact.create({
                        data: {
                            firstName: lead.firstName,
                            lastName: lead.lastName,
                            email: lead.email,
                            phone: lead.phone,
                            jobTitle: lead.jobTitle,
                            ownerId: lead.ownerId,
                            accountId: accountId
                        }
                    });
                    contactId = contact.id;
                }

                // 3. Create Opportunity (Stage 6 start)
                if (body.createOpportunity && !opportunityId && accountId) {
                    const opportunity = await tx.opportunity.create({
                        data: {
                            name: `${lead.company || lead.lastName} - ${lead.need || 'New Deal'}`,
                            amount: lead.budget || 0,
                            stage: 'OPPORTUNITY',
                            probability: 20,
                            closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            accountId: accountId,
                            contactId: contactId,
                            ownerId: lead.ownerId,
                        }
                    });
                    opportunityId = opportunity.id;
                }

                // 4. Update Lead
                const updatedLead = await tx.lead.update({
                    where: { id },
                    data: {
                        status: 'QUALIFIED',
                        convertedAccountId: accountId,
                        convertedContactId: contactId,
                        convertedOpportunityId: opportunityId
                    }
                });

                return { lead: updatedLead, accountId, contactId, opportunityId };
            });

            return { success: true, data: result };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al calificar prospecto' });
        }
    });

    // PUT /api/leads/:id
    fastify.put('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const result = leadSchema.partial().safeParse(request.body);
            if (!result.success) return reply.status(400).send(result.error);

            const updated = await prisma.lead.update({
                where: { id },
                data: result.data
            });
            return { data: updated };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al actualizar prospecto' });
        }
    });
};

export default leadsRoutes;
