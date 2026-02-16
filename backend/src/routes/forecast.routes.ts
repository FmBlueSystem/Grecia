import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

// Stage probability defaults (used when probability is missing)
const STAGE_PROBABILITIES: Record<string, number> = {
    OPPORTUNITY: 20,
    PROPOSAL: 40,
    FOLLOW_UP: 60,
    NEGOTIATION: 80,
    CLOSED_WON: 100,
    CLOSED_LOST: 0,
};

export default async function forecastRoutes(fastify: FastifyInstance) {
    // GET /api/forecast
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { sapSalesPersonCode, scopeLevel } = request.user as any;
            const ownerFilter = scopeLevel === 'ALL' ? {} : { owner: { sapSalesPersonCode } };

            // Parallel queries for performance
            const [openOpps, closedOpps, recentWins, recentLosses] = await Promise.all([
                // Open opportunities
                prisma.opportunity.findMany({
                    where: { isClosed: false, ...ownerFilter },
                    include: { account: { select: { name: true } } },
                }),
                // Closed opportunities (for win rate)
                prisma.opportunity.findMany({
                    where: { isClosed: true, ...ownerFilter },
                    select: { isWon: true, amount: true },
                }),
                // Recent wins
                prisma.opportunity.findMany({
                    where: { isClosed: true, isWon: true, ...ownerFilter },
                    orderBy: { updatedAt: 'desc' },
                    take: 5,
                    include: { account: { select: { name: true } } },
                }),
                // Recent losses
                prisma.opportunity.findMany({
                    where: { isClosed: true, isWon: false, ...ownerFilter },
                    orderBy: { updatedAt: 'desc' },
                    take: 5,
                    include: { account: { select: { name: true } } },
                }),
            ]);

            // --- Summary ---
            const totalPipeline = openOpps.reduce((sum, o) => sum + o.amount, 0);
            const weightedPipeline = openOpps.reduce((sum, o) => {
                const prob = o.probability ?? STAGE_PROBABILITIES[o.stage] ?? 50;
                return sum + (o.amount * prob / 100);
            }, 0);
            const avgDealSize = openOpps.length > 0 ? totalPipeline / openOpps.length : 0;

            // Average close time (days from created to closeDate for closed-won)
            const wonOpps = await prisma.opportunity.findMany({
                where: { isClosed: true, isWon: true, ...ownerFilter },
                select: { createdAt: true, closeDate: true },
                take: 100,
                orderBy: { updatedAt: 'desc' },
            });
            const avgCloseTime = wonOpps.length > 0
                ? wonOpps.reduce((sum, o) => {
                    const days = Math.ceil((o.closeDate.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + Math.max(days, 0);
                }, 0) / wonOpps.length
                : 0;

            // Win rate
            const totalClosed = closedOpps.length;
            const totalWon = closedOpps.filter(o => o.isWon).length;
            const winRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

            const summary = {
                totalPipeline: Math.round(totalPipeline),
                weightedPipeline: Math.round(weightedPipeline),
                avgDealSize: Math.round(avgDealSize),
                avgCloseTime: Math.round(avgCloseTime),
                winRate: Math.round(winRate * 10) / 10,
                dealsInPipeline: openOpps.length,
            };

            // --- By Stage ---
            const stageMap = new Map<string, { count: number; value: number; weighted: number }>();
            for (const opp of openOpps) {
                const entry = stageMap.get(opp.stage) || { count: 0, value: 0, weighted: 0 };
                const prob = opp.probability ?? STAGE_PROBABILITIES[opp.stage] ?? 50;
                entry.count++;
                entry.value += opp.amount;
                entry.weighted += opp.amount * prob / 100;
                stageMap.set(opp.stage, entry);
            }
            const byStage = Array.from(stageMap.entries()).map(([stage, data]) => ({
                stage,
                count: data.count,
                value: Math.round(data.value),
                weighted: Math.round(data.weighted),
            }));

            // --- By Month (projection based on closeDate) ---
            const monthMap = new Map<string, { deals: number; value: number; weighted: number }>();
            for (const opp of openOpps) {
                const month = opp.closeDate.toISOString().slice(0, 7); // YYYY-MM
                const entry = monthMap.get(month) || { deals: 0, value: 0, weighted: 0 };
                const prob = opp.probability ?? STAGE_PROBABILITIES[opp.stage] ?? 50;
                entry.deals++;
                entry.value += opp.amount;
                entry.weighted += opp.amount * prob / 100;
                monthMap.set(month, entry);
            }
            const byMonth = Array.from(monthMap.entries())
                .map(([month, data]) => ({
                    month,
                    deals: data.deals,
                    value: Math.round(data.value),
                    weighted: Math.round(data.weighted),
                }))
                .sort((a, b) => a.month.localeCompare(b.month));

            return {
                summary,
                byStage,
                byMonth,
                recentWins: recentWins.map(o => ({
                    name: o.name,
                    amount: o.amount,
                    accountName: o.account.name,
                    closedAt: o.updatedAt.toISOString(),
                })),
                recentLosses: recentLosses.map(o => ({
                    name: o.name,
                    amount: o.amount,
                    accountName: o.account.name,
                    reason: o.stage,
                })),
            };
        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch forecast data' });
        }
    });
}
