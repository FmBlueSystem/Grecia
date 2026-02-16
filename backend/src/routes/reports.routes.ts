import { FastifyInstance } from 'fastify';
import { sapGet, loadSalesPersons, CountryCode } from '../services/sap-proxy.service';

export default async function reportsRoutes(fastify: FastifyInstance) {
    // GET /api/reports - Dashboard de reportes con datos SAP reales
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const cc = request.companyCode as CountryCode;
            const spMap = await loadSalesPersons(cc);

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const dateFilter = sixMonthsAgo.toISOString().split('T')[0];

            const [invoicesData, ordersData, quotesData] = await Promise.all([
                sapGet(cc, `Invoices?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocTotal,DocDate,SalesPersonCode,PaidToDate,CardCode,CardName&$top=1000`).catch(() => ({ value: [] })),
                sapGet(cc, `Orders?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocTotal,DocDate,SalesPersonCode,CardCode&$top=1000`).catch(() => ({ value: [] })),
                sapGet(cc, `Quotations?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocTotal,DocDate,SalesPersonCode,DocumentStatus&$top=1000`).catch(() => ({ value: [] })),
            ]);

            const invoices = invoicesData.value || [];
            const orders = ordersData.value || [];
            const quotes = quotesData.value || [];

            // KPIs
            const totalRevenue = invoices.reduce((s: number, i: any) => s + (Number(i.DocTotal) || 0), 0);
            const totalQuotes = quotes.length;
            const totalOrders = orders.length;
            const avgTicket = orders.length > 0
                ? orders.reduce((s: number, o: any) => s + (Number(o.DocTotal) || 0), 0) / orders.length
                : 0;
            // Conversion: closed quotes (copied to order) / total quotes
            const closedQuotes = quotes.filter((q: any) => q.DocumentStatus === 'bost_Close').length;
            const conversionRate = totalQuotes > 0
                ? Math.round((closedQuotes / totalQuotes) * 100)
                : 0;

            // Top sellers by invoiced revenue
            const sellerRevenue = new Map<number, { name: string; revenue: number; orders: number }>();
            for (const inv of invoices) {
                const code = inv.SalesPersonCode ?? -1;
                const existing = sellerRevenue.get(code);
                if (existing) {
                    existing.revenue += Number(inv.DocTotal) || 0;
                } else {
                    sellerRevenue.set(code, {
                        name: spMap.get(code) || `Vendedor ${code}`,
                        revenue: Number(inv.DocTotal) || 0,
                        orders: 0,
                    });
                }
            }
            for (const ord of orders) {
                const code = ord.SalesPersonCode ?? -1;
                const existing = sellerRevenue.get(code);
                if (existing) {
                    existing.orders++;
                } else {
                    sellerRevenue.set(code, {
                        name: spMap.get(code) || `Vendedor ${code}`,
                        revenue: 0,
                        orders: 1,
                    });
                }
            }
            const topSellers = Array.from(sellerRevenue.entries())
                .filter(([code]) => code >= 0)
                .map(([code, data]) => ({
                    id: String(code),
                    name: data.name.trim(),
                    revenue: Math.round(data.revenue),
                    orders: data.orders,
                }))
                .filter(s => !['Stia', 'STIA', 'stia'].includes(s.name))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            // Revenue by client (top 10)
            const clientRevenue = new Map<string, { name: string; revenue: number }>();
            for (const inv of invoices) {
                const code = inv.CardCode || 'UNKNOWN';
                const existing = clientRevenue.get(code);
                if (existing) {
                    existing.revenue += Number(inv.DocTotal) || 0;
                } else {
                    clientRevenue.set(code, {
                        name: inv.CardName || code,
                        revenue: Number(inv.DocTotal) || 0,
                    });
                }
            }
            const topClients = Array.from(clientRevenue.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10)
                .map(c => ({ name: c.name, value: Math.round(c.revenue) }));

            // Revenue by month (last 6)
            const monthlyRevenue = new Map<string, number>();
            for (const inv of invoices) {
                const d = new Date(inv.DocDate);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthlyRevenue.set(key, (monthlyRevenue.get(key) || 0) + (Number(inv.DocTotal) || 0));
            }
            const revenueByMonth = Array.from(monthlyRevenue.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, value]) => ({
                    name: new Date(month + '-01').toLocaleDateString('es', { month: 'short' }),
                    revenue: Math.round(value),
                }));

            return {
                kpis: {
                    totalRevenue: Math.round(totalRevenue),
                    totalQuotes,
                    conversionRate,
                    avgTicket: Math.round(avgTicket),
                },
                topSellers,
                topClients,
                revenueByMonth,
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al generar reportes' });
        }
    });
}
