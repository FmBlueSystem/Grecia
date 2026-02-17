import { FastifyInstance } from 'fastify';
import { sapGet, loadSalesPersons, CountryCode } from '../services/sap-proxy.service';

interface Notification {
    id: string;
    type: 'overdue_invoice' | 'expiring_quote' | 'inactive_client' | 'high_balance';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    meta: Record<string, any>;
    date: string;
}

export default async function notificationsRoutes(fastify: FastifyInstance) {
    // GET /api/notifications
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const cc = request.companyCode as CountryCode;
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const spMap = await loadSalesPersons(cc);
            const spName = (code: number) => spMap.get(code) || '-';
            const now = new Date();
            const notifications: Notification[] = [];

            // Seller filter for non-admin users
            const sellerFilter = scopeLevel === 'ALL' ? '' : ` and SalesPersonCode eq ${sapSalesPersonCode}`;

            // 1. Overdue invoices (unpaid past due date)
            const overdueData = await sapGet(cc,
                `Invoices?$filter=DocumentStatus eq 'bost_Open' and DocDueDate lt '${now.toISOString().split('T')[0]}'${sellerFilter}&$select=DocEntry,DocNum,CardName,DocTotal,PaidToDate,DocDueDate,SalesPersonCode&$orderby=DocDueDate asc&$top=50`
            ).catch(() => ({ value: [] }));

            for (const inv of overdueData.value || []) {
                const balance = (Number(inv.DocTotal) || 0) - (Number(inv.PaidToDate) || 0);
                if (balance <= 0) continue;
                const daysOverdue = Math.floor((now.getTime() - new Date(inv.DocDueDate).getTime()) / 86400000);
                notifications.push({
                    id: `ov-${inv.DocEntry}`,
                    type: 'overdue_invoice',
                    severity: daysOverdue > 30 ? 'critical' : 'warning',
                    title: `Factura #${inv.DocNum} vencida`,
                    description: `${inv.CardName} — $${Math.round(balance).toLocaleString()} pendiente, ${daysOverdue} dias de atraso`,
                    meta: { docNum: inv.DocNum, docEntry: inv.DocEntry, balance, daysOverdue, client: inv.CardName, seller: spName(inv.SalesPersonCode) },
                    date: inv.DocDueDate,
                });
            }

            // 2. Expiring quotes (open, due within 7 days)
            const sevenDaysFromNow = new Date(now);
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            const expiringData = await sapGet(cc,
                `Quotations?$filter=DocumentStatus eq 'bost_Open' and DocDueDate ge '${now.toISOString().split('T')[0]}' and DocDueDate le '${sevenDaysFromNow.toISOString().split('T')[0]}'${sellerFilter}&$select=DocEntry,DocNum,CardName,DocTotal,DocDueDate,SalesPersonCode&$orderby=DocDueDate asc&$top=30`
            ).catch(() => ({ value: [] }));

            for (const q of expiringData.value || []) {
                const daysLeft = Math.floor((new Date(q.DocDueDate).getTime() - now.getTime()) / 86400000);
                notifications.push({
                    id: `eq-${q.DocEntry}`,
                    type: 'expiring_quote',
                    severity: daysLeft <= 2 ? 'critical' : 'warning',
                    title: `Oferta #${q.DocNum} por vencer`,
                    description: `${q.CardName} — $${Math.round(Number(q.DocTotal) || 0).toLocaleString()}, vence en ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`,
                    meta: { docNum: q.DocNum, docEntry: q.DocEntry, total: Number(q.DocTotal) || 0, daysLeft, client: q.CardName, seller: spName(q.SalesPersonCode) },
                    date: q.DocDueDate,
                });
            }

            // 3. High balance clients (top 10 with highest open balance)
            if (scopeLevel === 'ALL') {
                const highBalanceData = await sapGet(cc,
                    `BusinessPartners?$filter=CurrentAccountBalance gt 10000 and CardType eq 'cCustomer'&$select=CardCode,CardName,CurrentAccountBalance&$orderby=CurrentAccountBalance desc&$top=10`
                ).catch(() => ({ value: [] }));

                for (const bp of highBalanceData.value || []) {
                    const balance = Number(bp.CurrentAccountBalance) || 0;
                    if (balance > 50000) {
                        notifications.push({
                            id: `hb-${bp.CardCode}`,
                            type: 'high_balance',
                            severity: balance > 100000 ? 'critical' : 'info',
                            title: `Saldo alto: ${bp.CardName}`,
                            description: `Balance pendiente de $${Math.round(balance).toLocaleString()}`,
                            meta: { cardCode: bp.CardCode, client: bp.CardName, balance },
                            date: now.toISOString().split('T')[0],
                        });
                    }
                }
            }

            // Sort: critical first, then warning, then info
            const severityOrder = { critical: 0, warning: 1, info: 2 };
            notifications.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

            // Summary counts
            const summary = {
                total: notifications.length,
                critical: notifications.filter(n => n.severity === 'critical').length,
                warning: notifications.filter(n => n.severity === 'warning').length,
                info: notifications.filter(n => n.severity === 'info').length,
                overdueInvoices: notifications.filter(n => n.type === 'overdue_invoice').length,
                expiringQuotes: notifications.filter(n => n.type === 'expiring_quote').length,
            };

            return { summary, notifications };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener notificaciones' });
        }
    });
}
