import { FastifyInstance } from 'fastify';
import { sapGet, loadSalesPersons, CountryCode } from '../services/sap-proxy.service';

export default async function reportsRoutes(fastify: FastifyInstance) {
    // GET /api/reports - Dashboard de reportes con datos SAP reales
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const cc = request.companyCode as CountryCode;
            const query = request.query as Record<string, string>;
            const months = Math.min(Math.max(Number(query.months) || 6, 1), 24);
            const spMap = await loadSalesPersons(cc);

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - months);
            const dateFilter = sixMonthsAgo.toISOString().split('T')[0];

            const [invoicesData, ordersData, quotesData] = await Promise.all([
                sapGet(cc, `Invoices?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocTotal,DocDate,SalesPersonCode,PaidToDate,CardCode,CardName&$top=1000`).catch(() => ({ value: [] })),
                sapGet(cc, `Orders?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocTotal,DocDate,SalesPersonCode,CardCode&$top=1000`).catch(() => ({ value: [] })),
                sapGet(cc, `Quotations?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocTotal,DocDate,SalesPersonCode,DocumentStatus&$top=1000`).catch(() => ({ value: [] })),
            ]);

            const invoices = invoicesData.value || [];
            const orders = ordersData.value || [];
            const quotes = quotesData.value || [];

            // KPIs (basic - profit calculated later from invoice details)
            const totalRevenue = invoices.reduce((s: number, i: any) => s + (Number(i.DocTotal) || 0), 0);
            const totalQuotes = quotes.length;
            const totalOrders = orders.length;
            const avgTicket = orders.length > 0
                ? orders.reduce((s: number, o: any) => s + (Number(o.DocTotal) || 0), 0) / orders.length
                : 0;
            const closedQuotes = quotes.filter((q: any) => q.DocumentStatus === 'bost_Close').length;
            const conversionRate = totalQuotes > 0
                ? Math.round((closedQuotes / totalQuotes) * 100)
                : 0;

            // Top sellers by invoiced revenue (profit filled later from detail fetches)
            const sellerRevenue = new Map<number, { name: string; revenue: number; profit: number; orders: number }>();
            for (const inv of invoices) {
                const code = inv.SalesPersonCode ?? -1;
                const existing = sellerRevenue.get(code);
                if (existing) {
                    existing.revenue += Number(inv.DocTotal) || 0;
                } else {
                    sellerRevenue.set(code, {
                        name: spMap.get(code) || `Vendedor ${code}`,
                        revenue: Number(inv.DocTotal) || 0,
                        profit: 0,
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
                        profit: 0,
                        orders: 1,
                    });
                }
            }

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

            // Fetch invoice details for products + profit (GrossProfit only available at line level)
            // Build map: DocEntry -> SalesPersonCode for profit-per-seller
            const entryToSeller = new Map<number, number>();
            for (const inv of invoices) {
                entryToSeller.set(inv.DocEntry, inv.SalesPersonCode ?? -1);
            }
            const topInvoiceEntries = invoices
                .sort((a: any, b: any) => (Number(b.DocTotal) || 0) - (Number(a.DocTotal) || 0))
                .slice(0, 50)
                .map((i: any) => i.DocEntry);
            const productMap = new Map<string, { code: string; name: string; qty: number; revenue: number; profit: number }>();
            const sellerProfit = new Map<number, number>(); // SalesPersonCode -> profit
            let totalGrossProfit = 0;
            const linePromises = topInvoiceEntries.map((entry: number) =>
                sapGet(cc, `Invoices(${entry})?$select=DocEntry,DocumentLines`).catch(() => null)
            );
            const lineResults = await Promise.all(linePromises);
            for (const inv of lineResults) {
                if (!inv?.DocumentLines) continue;
                let invProfit = 0;
                for (const line of inv.DocumentLines) {
                    const code = line.ItemCode || 'SIN-CODIGO';
                    const existing = productMap.get(code);
                    const lineRevenue = Number(line.LineTotal) || 0;
                    const lineProfit = Number(line.GrossProfit) || 0;
                    invProfit += lineProfit;
                    if (existing) {
                        existing.qty += Number(line.Quantity) || 0;
                        existing.revenue += lineRevenue;
                        existing.profit += lineProfit;
                    } else {
                        productMap.set(code, {
                            code,
                            name: line.ItemDescription || code,
                            qty: Number(line.Quantity) || 0,
                            revenue: lineRevenue,
                            profit: lineProfit,
                        });
                    }
                }
                totalGrossProfit += invProfit;
                // Map profit to seller
                const spCode = entryToSeller.get(inv.DocEntry) ?? -1;
                sellerProfit.set(spCode, (sellerProfit.get(spCode) || 0) + invProfit);
            }

            // Update seller profit from detail fetches
            for (const [spCode, profit] of sellerProfit) {
                const seller = sellerRevenue.get(spCode);
                if (seller) seller.profit += profit;
            }

            // Prorate grossProfit if we only fetched a subset of invoices
            const fetchedRevenue = topInvoiceEntries.reduce((s: number, entry: number) => {
                const inv = invoices.find((i: any) => i.DocEntry === entry);
                return s + (Number(inv?.DocTotal) || 0);
            }, 0);
            const revenueRatio = fetchedRevenue > 0 ? totalRevenue / fetchedRevenue : 1;
            const estimatedGrossProfit = Math.round(totalGrossProfit * revenueRatio);
            const profitMargin = totalRevenue > 0 ? Math.round((estimatedGrossProfit / totalRevenue) * 100) : 0;

            const topSellers = Array.from(sellerRevenue.entries())
                .filter(([code]) => code >= 0)
                .map(([code, data]) => ({
                    id: String(code),
                    name: data.name.trim(),
                    revenue: Math.round(data.revenue),
                    profit: Math.round(data.profit * revenueRatio),
                    margin: data.revenue > 0 ? Math.round((data.profit * revenueRatio / data.revenue) * 100) : 0,
                    orders: data.orders,
                }))
                .filter(s => !['Stia', 'STIA', 'stia'].includes(s.name))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10);

            const topProducts = Array.from(productMap.values())
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 15)
                .map(p => ({
                    ...p,
                    qty: Math.round(p.qty),
                    revenue: Math.round(p.revenue),
                    profit: Math.round(p.profit),
                    margin: p.revenue > 0 ? Math.round((p.profit / p.revenue) * 100) : 0,
                }));

            return {
                kpis: {
                    totalRevenue: Math.round(totalRevenue),
                    grossProfit: estimatedGrossProfit,
                    profitMargin,
                    totalQuotes,
                    conversionRate,
                    avgTicket: Math.round(avgTicket),
                },
                topSellers,
                topClients,
                topProducts,
                revenueByMonth,
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al generar reportes' });
        }
    });
}
