import { FastifyInstance } from 'fastify';
import { sapGet, loadSalesPersons, CountryCode } from '../services/sap-proxy.service';

export default async function managerRoutes(fastify: FastifyInstance) {
    // ─── CLIENT 360° ────────────────────────────────────────
    fastify.get('/client-360/:cardCode', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { cardCode } = request.params as { cardCode: string };
            const cc = request.companyCode as CountryCode;
            const spMap = await loadSalesPersons(cc);

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 12);
            const dateFilter = sixMonthsAgo.toISOString().split('T')[0];

            // Parallel SAP queries
            const [bpData, ordersData, invoicesData, quotesData, activitiesData] = await Promise.all([
                sapGet(cc, `BusinessPartners('${cardCode}')?$select=CardCode,CardName,Phone1,Website,Country,Industry,SalesPersonCode,CurrentAccountBalance,OpenDeliveryNotesBalance,OpenOrdersBalance`).catch(() => null),
                sapGet(cc, `Orders?$filter=CardCode eq '${cardCode}' and DocDate ge '${dateFilter}'&$select=DocEntry,DocNum,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode&$orderby=DocDate desc&$top=50`).catch(() => ({ value: [] })),
                sapGet(cc, `Invoices?$filter=CardCode eq '${cardCode}' and DocDate ge '${dateFilter}'&$select=DocEntry,DocNum,DocTotal,DocDate,DocDueDate,DocumentStatus,PaidToDate,SalesPersonCode&$orderby=DocDate desc&$top=100`).catch(() => ({ value: [] })),
                sapGet(cc, `Quotations?$filter=CardCode eq '${cardCode}' and DocumentStatus eq 'bost_Open'&$select=DocEntry,DocNum,DocTotal,DocDate,DocDueDate,SalesPersonCode&$orderby=DocDate desc&$top=20`).catch(() => ({ value: [] })),
                sapGet(cc, `Activities?$filter=CardCode eq '${cardCode}'&$select=ActivityCode,ActivityType,Subject,ActivityDate,HandledBy&$orderby=ActivityDate desc&$top=10`).catch(() => ({ value: [] })),
            ]);

            if (!bpData) return reply.code(404).send({ error: 'Cliente no encontrado' });

            const orders = ordersData.value || [];
            const invoices = invoicesData.value || [];
            const quotes = quotesData.value || [];
            const activities = (activitiesData.value || []);

            // Summary calculations
            const totalInvoiceRevenue = invoices.reduce((s: number, i: any) => s + (Number(i.DocTotal) || 0), 0);
            const totalOrdersValue = orders.reduce((s: number, o: any) => s + (Number(o.DocTotal) || 0), 0);
            const openBalance = invoices.reduce((s: number, i: any) => s + ((Number(i.DocTotal) || 0) - (Number(i.PaidToDate) || 0)), 0);
            const overdueInvoices = invoices.filter((i: any) => {
                const balance = (Number(i.DocTotal) || 0) - (Number(i.PaidToDate) || 0);
                return balance > 0 && new Date(i.DocDueDate) < new Date();
            });
            const lastPurchase = orders.length > 0 ? orders[0].DocDate : null;
            const lastActivity = activities.length > 0 ? activities[0].ActivityDate : null;
            const daysSinceLastContact = lastActivity
                ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / 86400000)
                : 999;

            // Top products from invoice lines (query top 15 invoices individually)
            const topInvoiceEntries = invoices.slice(0, 15).map((i: any) => i.DocEntry);
            const productMap = new Map<string, { code: string; name: string; qty: number; value: number }>();

            const linePromises = topInvoiceEntries.map((entry: number) =>
                sapGet(cc, `Invoices(${entry})?$select=DocEntry,DocumentLines`).catch(() => null)
            );
            const lineResults = await Promise.all(linePromises);
            for (const inv of lineResults) {
                if (!inv?.DocumentLines) continue;
                for (const line of inv.DocumentLines) {
                    const code = line.ItemCode || 'SIN-CODIGO';
                    const existing = productMap.get(code);
                    if (existing) {
                        existing.qty += Number(line.Quantity) || 0;
                        existing.value += Number(line.LineTotal) || 0;
                    } else {
                        productMap.set(code, {
                            code,
                            name: line.ItemDescription || code,
                            qty: Number(line.Quantity) || 0,
                            value: Number(line.LineTotal) || 0,
                        });
                    }
                }
            }
            const topProducts = Array.from(productMap.values())
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);

            // Activity type mapping
            const actTypeMap: Record<number, string> = { 1: 'Llamada', 2: 'Reunión', 3: 'Tarea', 4: 'Nota', 5: 'Email' };

            const spName = (code: number) => spMap.get(code) || '-';

            return {
                client: {
                    cardCode: bpData.CardCode,
                    name: bpData.CardName,
                    phone: bpData.Phone1,
                    website: bpData.Website,
                    country: bpData.Country,
                    industry: bpData.Industry,
                    salesPerson: spName(bpData.SalesPersonCode),
                    currentBalance: Number(bpData.CurrentAccountBalance) || 0,
                },
                summary: {
                    totalRevenue: Math.round(totalInvoiceRevenue),
                    totalOrders: orders.length,
                    totalInvoices: invoices.length,
                    avgOrderValue: orders.length > 0 ? Math.round(totalOrdersValue / orders.length) : 0,
                    openBalance: Math.round(openBalance),
                    overdueCount: overdueInvoices.length,
                    overdueAmount: Math.round(overdueInvoices.reduce((s: number, i: any) => s + (Number(i.DocTotal) || 0) - (Number(i.PaidToDate) || 0), 0)),
                    lastPurchaseDate: lastPurchase,
                    lastActivityDate: lastActivity,
                    daysSinceLastContact,
                    openQuotesCount: quotes.length,
                    openQuotesValue: Math.round(quotes.reduce((s: number, q: any) => s + (Number(q.DocTotal) || 0), 0)),
                },
                topProducts,
                recentOrders: orders.slice(0, 5).map((o: any) => ({
                    docNum: o.DocNum,
                    date: o.DocDate,
                    total: Number(o.DocTotal) || 0,
                    status: o.DocumentStatus === 'bost_Open' ? 'Abierta' : 'Cerrada',
                    seller: spName(o.SalesPersonCode),
                })),
                recentInvoices: invoices.slice(0, 5).map((i: any) => ({
                    docNum: i.DocNum,
                    date: i.DocDate,
                    total: Number(i.DocTotal) || 0,
                    paid: Number(i.PaidToDate) || 0,
                    balance: (Number(i.DocTotal) || 0) - (Number(i.PaidToDate) || 0),
                    dueDate: i.DocDueDate,
                    overdue: ((Number(i.DocTotal) || 0) - (Number(i.PaidToDate) || 0)) > 0 && new Date(i.DocDueDate) < new Date(),
                })),
                openQuotes: quotes.slice(0, 5).map((q: any) => ({
                    docNum: q.DocNum,
                    date: q.DocDate,
                    total: Number(q.DocTotal) || 0,
                    validUntil: q.DocDueDate,
                    seller: spName(q.SalesPersonCode),
                })),
                recentActivities: activities.slice(0, 8).map((a: any) => ({
                    type: actTypeMap[a.ActivityType] || 'Otro',
                    subject: a.Subject || '-',
                    date: a.ActivityDate,
                    handler: spName(a.HandledBy),
                })),
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener ficha 360°' });
        }
    });

    // ─── SELLER SCORECARD ───────────────────────────────────
    fastify.get('/seller-scorecard', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const cc = request.companyCode as CountryCode;
            const query = request.query as Record<string, string>;
            const months = Math.min(Math.max(Number(query.months) || 6, 1), 24);
            const spMap = await loadSalesPersons(cc);

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - months);
            const dateFilter = sixMonthsAgo.toISOString().split('T')[0];

            const [quotesData, ordersData, invoicesData] = await Promise.all([
                sapGet(cc, `Quotations?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocNum,DocTotal,DocDate,DocumentStatus,SalesPersonCode&$top=500`).catch(() => ({ value: [] })),
                sapGet(cc, `Orders?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocNum,DocTotal,DocDate,DocumentStatus,SalesPersonCode&$top=500`).catch(() => ({ value: [] })),
                sapGet(cc, `Invoices?$filter=DocDate ge '${dateFilter}'&$select=DocEntry,DocNum,DocTotal,DocDate,PaidToDate,SalesPersonCode&$top=500`).catch(() => ({ value: [] })),
            ]);

            const quotes = quotesData.value || [];
            const orders = ordersData.value || [];
            const invoices = invoicesData.value || [];

            // Group by seller
            interface SellerData {
                code: number;
                name: string;
                quotesCount: number;
                quotesTotal: number;
                ordersCount: number;
                ordersTotal: number;
                invoicesCount: number;
                invoicesTotal: number;
                invoicesPaid: number;
            }
            const sellerMap = new Map<number, SellerData>();

            const ensureSeller = (code: number): SellerData => {
                if (!sellerMap.has(code)) {
                    sellerMap.set(code, {
                        code,
                        name: spMap.get(code) || `Vendedor ${code}`,
                        quotesCount: 0, quotesTotal: 0,
                        ordersCount: 0, ordersTotal: 0,
                        invoicesCount: 0, invoicesTotal: 0, invoicesPaid: 0,
                    });
                }
                return sellerMap.get(code)!;
            };

            for (const q of quotes) {
                const s = ensureSeller(q.SalesPersonCode);
                s.quotesCount++;
                s.quotesTotal += Number(q.DocTotal) || 0;
            }
            for (const o of orders) {
                const s = ensureSeller(o.SalesPersonCode);
                s.ordersCount++;
                s.ordersTotal += Number(o.DocTotal) || 0;
            }
            for (const i of invoices) {
                const s = ensureSeller(i.SalesPersonCode);
                s.invoicesCount++;
                s.invoicesTotal += Number(i.DocTotal) || 0;
                s.invoicesPaid += Number(i.PaidToDate) || 0;
            }

            const sellers = Array.from(sellerMap.values())
                .filter(s => s.name && s.code >= 0)
                .map(s => ({
                    code: s.code,
                    name: s.name.trim(),
                    quotes: { count: s.quotesCount, total: Math.round(s.quotesTotal) },
                    orders: { count: s.ordersCount, total: Math.round(s.ordersTotal) },
                    invoices: { count: s.invoicesCount, total: Math.round(s.invoicesTotal) },
                    avgTicket: s.ordersCount > 0 ? Math.round(s.ordersTotal / s.ordersCount) : 0,
                    conversionRate: s.quotesCount > 0 ? Math.round((s.ordersCount / s.quotesCount) * 100) : 0,
                    collectionRate: s.invoicesTotal > 0 ? Math.round((s.invoicesPaid / s.invoicesTotal) * 100) : 0,
                }))
                .sort((a, b) => b.invoices.total - a.invoices.total);

            // Alerts
            const now = new Date();
            const expiringQuotes = quotes.filter((q: any) => {
                const due = new Date(q.DocDueDate);
                const daysLeft = (due.getTime() - now.getTime()) / 86400000;
                return q.DocumentStatus === 'bost_Open' && daysLeft >= 0 && daysLeft <= 7;
            }).length;

            const overdueInvoices = invoices.filter((i: any) => {
                const balance = (Number(i.DocTotal) || 0) - (Number(i.PaidToDate) || 0);
                return balance > 0 && new Date(i.DocDueDate) < now;
            });
            const overdueTotal = overdueInvoices.reduce((s: number, i: any) =>
                s + (Number(i.DocTotal) || 0) - (Number(i.PaidToDate) || 0), 0);

            return {
                period: `${sixMonthsAgo.toLocaleDateString('es', { month: 'short', year: 'numeric' })} - ${now.toLocaleDateString('es', { month: 'short', year: 'numeric' })}`,
                sellers,
                totals: {
                    quotes: quotes.length,
                    orders: orders.length,
                    invoices: invoices.length,
                    revenue: Math.round(invoices.reduce((s: number, i: any) => s + (Number(i.DocTotal) || 0), 0)),
                },
                alerts: {
                    expiringQuotes,
                    overdueInvoices: overdueInvoices.length,
                    overdueAmount: Math.round(overdueTotal),
                    unassignedQuotes: quotes.filter((q: any) => !q.SalesPersonCode || q.SalesPersonCode < 0).length,
                },
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener scorecard' });
        }
    });

    // ─── CLIENT SEARCH (for autocomplete) ───────────────────
    fastify.get('/clients', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { q } = request.query as { q?: string };
            const cc = request.companyCode as CountryCode;
            const qUpper = q ? q.toUpperCase() : '';
            const filter = qUpper ? `contains(CardName,'${qUpper}') and CardType eq 'cCustomer'` : "CardType eq 'cCustomer'";
            const data = await sapGet(cc, `BusinessPartners?$filter=${filter}&$select=CardCode,CardName,Phone1,Country&$top=20&$orderby=CardName`);
            return { data: (data.value || []).map((bp: any) => ({ cardCode: bp.CardCode, name: bp.CardName, phone: bp.Phone1, country: bp.Country })) };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al buscar clientes' });
        }
    });
}
