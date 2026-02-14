import prisma from '../lib/prisma';
import sapService from '../services/sap.service';
import { CountryCode } from '../config/companies';

export async function createOrderFromOpportunity(opportunityId: string, companyCode: CountryCode) {
    const opp = await prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: { account: true, contact: true }
    });

    if (!opp) throw new Error("Opportunity not found");

    // 1. Create Local Order
    const orderNumber = `ORD-${Date.now()}`;
    const newOrder = await prisma.order.create({
        data: {
            orderNumber,
            totalAmount: opp.amount,
            currency: opp.currency,
            status: 'PENDING',
            logisticsStatus: 'PROCESSING', // Initial Step
            opportunityId: opp.id,
            accountId: opp.accountId,
            contactId: opp.contactId,
            ownerId: opp.ownerId
        }
    });

    // 2. Sync to SAP (Async or Await based on requirement)
    // For MVP, we log the attempt. Real implementation would construct SAP Payload.
    try {
        /*
        const sapClient = await sapService.getClient(companyCode);
        const sapPayload = {
            CardCode: opp.account.sapId || 'C999999', // Fallback or lookup
            DocDate: new Date().toISOString().split('T')[0],
            DocDueDate: new Date().toISOString().split('T')[0],
            DocTotal: opp.amount
            // Items would go here
        };
        const sapRes = await sapClient.post('/Orders', sapPayload);
        await prisma.order.update({
             where: { id: newOrder.id },
             data: { sapOrderId: String(sapRes.data.DocEntry) }
        });
        */
        console.log(`[OrderService] Mock SAP Order created for Opp ${opportunityId} in ${companyCode}`);
    } catch (error) {
        console.error("[OrderService] SAP Sync Failed", error);
    }

    return newOrder;
}
