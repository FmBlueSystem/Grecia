import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function dashboardRoutes(fastify: FastifyInstance) {

    // GET /api/dashboard/stats
    fastify.get('/stats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const startOfThisWeek = new Date(now);
            const day = startOfThisWeek.getDay() || 7; // Get current day number, converting Sun. to 7
            if (day !== 1) startOfThisWeek.setHours(-24 * (day - 1)); // Set to Monday
            startOfThisWeek.setHours(0, 0, 0, 0);


            // 1. Pipeline Stats
            // Use aggregate for sum
            const pipelineAgg = await prisma.opportunity.aggregate({
                _sum: { amount: true },
                _count: { id: true },
                where: {
                    stage: { notIn: ['Closed Won', 'Closed Lost'] } // Open deals
                }
            });

            const pipelineValue = pipelineAgg._sum.amount || 0;
            const pipelineDeals = pipelineAgg._count.id || 0;

            // Weighted Pipeline (Need to fetch individual probabilities for accurate weight)
            // Or we can approximate or use raw SQL. Fetching is fine for MVP scale.
            const openOpportunities = await prisma.opportunity.findMany({
                where: { stage: { notIn: ['Closed Won', 'Closed Lost'] } },
                select: { amount: true, probability: true }
            });

            const weightedPipeline = openOpportunities.reduce(
                (sum, opp) => sum + (opp.amount * (opp.probability / 100)),
                0
            );

            // 2. Revenue MTD (Month to Date)
            // Assume "Closed Won" deals with closeDate in current month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const revenueAgg = await prisma.opportunity.aggregate({
                _sum: { amount: true },
                where: {
                    stage: 'Closed Won',
                    closeDate: {
                        gte: startOfMonth,
                        lte: now
                    }
                }
            });
            const revenueMTD = revenueAgg._sum.amount || 0;

            // 3. Win Rate
            // (Won) / (Won + Lost) * 100
            const wonCount = await prisma.opportunity.count({ where: { stage: 'Closed Won' } });
            const lostCount = await prisma.opportunity.count({ where: { stage: 'Closed Lost' } });
            const totalClosed = wonCount + lostCount;
            const winRate = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0;

            // 4. Activities
            const todayCount = await prisma.activity.count({
                where: {
                    dueDate: {
                        gte: startOfToday,
                        lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
                    },
                    isCompleted: false
                }
            });

            const weeklyCount = await prisma.activity.count({
                where: {
                    dueDate: {
                        gte: startOfThisWeek,
                    },
                    isCompleted: false
                }
            });

            const overdueCount = await prisma.activity.count({
                where: {
                    dueDate: { lt: startOfToday },
                    isCompleted: false
                }
            });


            return {
                revenue: {
                    mtd: revenueMTD,
                    target: 200000, // Hardcoded target for now
                    percentage: revenueMTD > 0 ? (revenueMTD / 200000) * 100 : 0,
                    trend: '+15%', // Mock trend
                },
                pipeline: {
                    value: pipelineValue,
                    weighted: Math.round(weightedPipeline),
                    deals: pipelineDeals,
                },
                winRate: {
                    percentage: Math.round(winRate),
                    trend: '+5%', // Mock trend
                },
                activities: {
                    today: todayCount,
                    thisWeek: weeklyCount,
                    overdue: overdueCount,
                },
            };

        } catch (error) {
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to fetch dashboard stats' });
        }
    });
}
