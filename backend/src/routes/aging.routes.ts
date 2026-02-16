import { FastifyInstance } from 'fastify';
import { sapGet, loadSalesPersons, CountryCode } from '../services/sap-proxy.service';

export default async function agingRoutes(fastify: FastifyInstance) {
    // GET /api/aging - Reporte de antigüedad de cuentas por cobrar
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const cc = request.companyCode as CountryCode;
            const spMap = await loadSalesPersons(cc);

            // Obtener todas las facturas con saldo pendiente
            const invoicesData = await sapGet(cc,
                `Invoices?$filter=DocumentStatus eq 'bost_Open'&$select=DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,PaidToDate,SalesPersonCode&$orderby=DocDueDate asc&$top=500`
            ).catch(() => ({ value: [] }));

            const invoices = invoicesData.value || [];
            const now = new Date();

            // Clasificar por rango de antigüedad
            const buckets = { current: [] as any[], days30: [] as any[], days60: [] as any[], days90: [] as any[], over90: [] as any[] };
            let totalOpen = 0;

            for (const inv of invoices) {
                const total = Number(inv.DocTotal) || 0;
                const paid = Number(inv.PaidToDate) || 0;
                const balance = total - paid;
                if (balance <= 0) continue;

                totalOpen += balance;
                const due = new Date(inv.DocDueDate);
                const daysOverdue = Math.floor((now.getTime() - due.getTime()) / 86400000);

                const record = {
                    docNum: inv.DocNum,
                    docEntry: inv.DocEntry,
                    client: inv.CardName || inv.CardCode,
                    cardCode: inv.CardCode,
                    total: Math.round(total),
                    paid: Math.round(paid),
                    balance: Math.round(balance),
                    dueDate: inv.DocDueDate,
                    daysOverdue: Math.max(0, daysOverdue),
                    seller: spMap.get(inv.SalesPersonCode) || '-',
                };

                if (daysOverdue <= 0) buckets.current.push(record);
                else if (daysOverdue <= 30) buckets.days30.push(record);
                else if (daysOverdue <= 60) buckets.days60.push(record);
                else if (daysOverdue <= 90) buckets.days90.push(record);
                else buckets.over90.push(record);
            }

            const sumBalance = (arr: any[]) => arr.reduce((s, r) => s + r.balance, 0);

            return {
                summary: {
                    totalOpen: Math.round(totalOpen),
                    current: { count: buckets.current.length, amount: sumBalance(buckets.current) },
                    days30: { count: buckets.days30.length, amount: sumBalance(buckets.days30) },
                    days60: { count: buckets.days60.length, amount: sumBalance(buckets.days60) },
                    days90: { count: buckets.days90.length, amount: sumBalance(buckets.days90) },
                    over90: { count: buckets.over90.length, amount: sumBalance(buckets.over90) },
                },
                details: [
                    ...buckets.over90,
                    ...buckets.days90,
                    ...buckets.days60,
                    ...buckets.days30,
                    ...buckets.current,
                ],
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al generar reporte de antigüedad' });
        }
    });
}
