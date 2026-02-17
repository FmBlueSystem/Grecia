import { FastifyInstance } from 'fastify';
import { sapGet, loadSalesPersons, CountryCode } from '../services/sap-proxy.service';

export default async function lostDealsRoutes(fastify: FastifyInstance) {
    // GET /api/lost-deals — Cotizaciones cerradas/canceladas que no se convirtieron en orden
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const cc = request.companyCode as CountryCode;
            const query = request.query as Record<string, string>;
            const months = Math.min(Math.max(Number(query.months) || 6, 1), 24);
            const spMap = await loadSalesPersons(cc);
            const spName = (code: number) => spMap.get(code) || '-';

            const cutoff = new Date();
            cutoff.setMonth(cutoff.getMonth() - months);
            const dateFilter = cutoff.toISOString().split('T')[0];

            // Get closed quotations in the period
            const quotesData = await sapGet(cc,
                `Quotations?$filter=DocumentStatus eq 'bost_Close' and DocDate ge '${dateFilter}'&$select=DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,SalesPersonCode&$orderby=DocDate desc&$top=200`
            ).catch(() => ({ value: [] }));

            const closedQuotes = quotesData.value || [];

            // For each closed quote, check if it has linked orders (batch check)
            // We'll check in batches to avoid N+1
            const lostDeals: any[] = [];

            // Check orders that reference these quotes (batch by chunks of 10)
            const linkedQuoteEntries = new Set<number>();
            const chunks: number[][] = [];
            for (let i = 0; i < closedQuotes.length; i += 10) {
                chunks.push(closedQuotes.slice(i, i + 10).map((q: any) => q.DocEntry));
            }

            for (const chunk of chunks) {
                const orFilter = chunk.map(e => `DocumentLines/any(d: d/BaseEntry eq ${e} and d/BaseType eq 23)`).join(' or ');
                try {
                    const orders = await sapGet(cc, `Orders?$filter=${orFilter}&$select=DocEntry,DocumentLines&$top=100`);
                    for (const ord of orders.value || []) {
                        for (const line of ord.DocumentLines || []) {
                            if (line.BaseType === 23 && line.BaseEntry) {
                                linkedQuoteEntries.add(line.BaseEntry);
                            }
                        }
                    }
                } catch { /* ignore */ }
            }

            // Quotes without linked orders = lost deals
            for (const q of closedQuotes) {
                if (!linkedQuoteEntries.has(q.DocEntry)) {
                    lostDeals.push({
                        docEntry: q.DocEntry,
                        docNum: q.DocNum,
                        client: q.CardName || q.CardCode,
                        cardCode: q.CardCode,
                        total: Number(q.DocTotal) || 0,
                        date: q.DocDate,
                        dueDate: q.DocDueDate,
                        salesPerson: spName(q.SalesPersonCode),
                        salesPersonCode: q.SalesPersonCode,
                    });
                }
            }

            // Summary stats
            const totalLostValue = lostDeals.reduce((s, d) => s + d.total, 0);
            const bySeller = new Map<string, { name: string; count: number; total: number }>();
            for (const d of lostDeals) {
                const existing = bySeller.get(d.salesPerson) || { name: d.salesPerson, count: 0, total: 0 };
                existing.count++;
                existing.total += d.total;
                bySeller.set(d.salesPerson, existing);
            }

            return {
                period: `${months} meses`,
                totalClosed: closedQuotes.length,
                totalConverted: closedQuotes.length - lostDeals.length,
                totalLost: lostDeals.length,
                totalLostValue: Math.round(totalLostValue),
                conversionRate: closedQuotes.length > 0
                    ? Math.round(((closedQuotes.length - lostDeals.length) / closedQuotes.length) * 100)
                    : 0,
                bySeller: Array.from(bySeller.values()).sort((a, b) => b.total - a.total),
                deals: lostDeals.slice(0, 100),
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Error al obtener ofertas perdidas' });
        }
    });
}
