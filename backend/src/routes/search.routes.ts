import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import * as sapProxy from '../services/sap-proxy.service';
import { escapeOData } from '../services/sap-proxy.service';

export default async function searchRoutes(fastify: FastifyInstance) {
    // GET /api/search?q=texto&limit=5
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const query = request.query as Record<string, string>;
            const q = (query.q || '').trim();
            const limit = Math.min(Number(query.limit) || 5, 10);

            if (!q || q.length < 2) {
                return { accounts: [], contacts: [], opportunities: [], quotes: [], orders: [], invoices: [] };
            }

            const { id: userId, sapSalesPersonCode, scopeLevel } = request.user as any;
            const spCode = scopeLevel === 'ALL' ? undefined : sapSalesPersonCode;
            const companyCode = request.companyCode;

            // Search all entities in parallel with individual error catching
            const [accounts, contacts, opportunities, quotes, orders, invoices] = await Promise.all([
                // SAP Accounts
                sapProxy.getAccounts(companyCode, { search: q, top: limit }, spCode)
                    .then(r => r.data.map((a: any) => ({
                        id: a.id, name: a.name, industry: a.industry, type: 'account' as const,
                    })))
                    .catch(() => []),

                // SAP Contacts
                sapProxy.getContacts(companyCode, { search: q, top: limit }, spCode)
                    .then(r => r.data.map((c: any) => ({
                        id: c.id,
                        name: `${c.firstName} ${c.lastName}`.trim(),
                        email: c.email,
                        account: c.accountName,
                        type: 'contact' as const,
                    })))
                    .catch(() => []),

                // Prisma Opportunities
                prisma.opportunity.findMany({
                    where: {
                        isClosed: false,
                        ...(scopeLevel === 'OWN' && { ownerId: userId }),
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { account: { name: { contains: q, mode: 'insensitive' } } },
                        ],
                    },
                    include: { account: { select: { name: true } } },
                    take: limit,
                    orderBy: { amount: 'desc' },
                }).then(opps => opps.map(o => ({
                    id: o.id,
                    name: o.name,
                    amount: o.amount,
                    stage: o.stage,
                    account: o.account.name,
                    type: 'opportunity' as const,
                }))).catch(() => []),

                // SAP Quotes
                sapProxy.getQuotes(companyCode, {
                    filter: `contains(CardName,'${escapeOData(q)}')`,
                    top: limit,
                }, spCode)
                    .then(r => r.data.map((qt: any) => ({
                        id: qt.id,
                        number: qt.quoteNumber,
                        client: qt.account?.name || '',
                        total: qt.totalAmount,
                        type: 'quote' as const,
                    })))
                    .catch(() => []),

                // SAP Orders
                sapProxy.getOrders(companyCode, {
                    filter: `contains(CardName,'${escapeOData(q)}')`,
                    top: limit,
                }, spCode)
                    .then(r => r.data.map((o: any) => ({
                        id: o.id,
                        number: o.orderNumber,
                        client: o.account?.name || '',
                        total: o.totalAmount,
                        type: 'order' as const,
                    })))
                    .catch(() => []),

                // SAP Invoices
                sapProxy.getInvoices(companyCode, {
                    filter: `contains(CardName,'${escapeOData(q)}')`,
                    top: limit,
                }, spCode)
                    .then(r => r.data.map((inv: any) => ({
                        id: inv.id,
                        number: inv.invoiceNumber,
                        client: inv.account?.name || '',
                        total: inv.amount,
                        status: inv.status,
                        type: 'invoice' as const,
                    })))
                    .catch(() => []),
            ]);

            return { accounts, contacts, opportunities, quotes, orders, invoices };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Search failed' });
        }
    });
}
