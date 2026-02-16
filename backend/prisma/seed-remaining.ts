/**
 * Seed remaining entities (Orders, Invoices, Activities)
 * Uses batch inserts for performance with large datasets.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';
import https from 'https';
import { CountryCode, COMPANIES, DEFAULT_COMPANY } from '../src/config/companies';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SAP_BASE_URL = 'https://sap-stiacmzdr-sl.skyinone.net:50000/b1s/v1';
const SAP_USER = process.env.SAP_USER || 'stifmolina2';
const SAP_PASSWORD = process.env.SAP_PASSWORD || 'FmDiosMio1';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const TARGET_COMPANY = (process.env.SEED_COMPANY as CountryCode) || DEFAULT_COMPANY;
const PAGE_SIZE = 100;
const BATCH_SIZE = 500;

let sessionId = '';

async function sapLogin(): Promise<string> {
    const company = COMPANIES[TARGET_COMPANY];
    const res = await axios.post(`${SAP_BASE_URL}/Login`, {
        CompanyDB: company.dbName, UserName: SAP_USER, Password: SAP_PASSWORD,
    }, { httpsAgent });
    sessionId = res.data.SessionId;
    console.log(`[SAP] Logged in to ${company.name}`);
    return sessionId;
}

async function sapGet<T = any>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
    const results: T[] = [];
    let url: string | null = `${SAP_BASE_URL}/${endpoint}`;
    const queryParams = new URLSearchParams(params);
    if (queryParams.toString()) url += `?${queryParams.toString()}`;

    while (url) {
        try {
            const res = await axios.get(url, {
                headers: { Cookie: `B1SESSION=${sessionId}`, Prefer: `odata.maxpagesize=${PAGE_SIZE}` },
                httpsAgent,
            });
            const data = res.data;
            if (data.value) results.push(...data.value);
            url = data['odata.nextLink'] ? `${SAP_BASE_URL}/${data['odata.nextLink']}` : null;
            if (results.length % 1000 === 0 && results.length > 0) console.log(`      ... ${results.length} fetched`);
        } catch (err: any) {
            console.error(`   [SAP ERROR] ${endpoint}: ${err.response?.data?.error?.message?.value || err.message}`);
            throw err;
        }
    }
    return results;
}

async function main() {
    console.log('🌱 Seed remaining: Orders, Invoices, Activities (batch mode)\n');
    await sapLogin();

    // Load mappings from DB
    const adminUser = await prisma.user.findUniqueOrThrow({ where: { email: 'freddy@bluesystem.com' } });
    const allUsers = await prisma.user.findMany({ where: { sapSalesPersonCode: { not: null } } });
    const spMap = new Map<number, string>();
    spMap.set(-1, adminUser.id);
    for (const u of allUsers) if (u.sapSalesPersonCode != null) spMap.set(u.sapSalesPersonCode, u.id);

    const allAccounts = await prisma.account.findMany({ where: { sapId: { not: null } }, select: { id: true, sapId: true } });
    const accMap = new Map<string, string>();
    for (const a of allAccounts) if (a.sapId) accMap.set(a.sapId, a.id);
    console.log(`   ${spMap.size} users, ${accMap.size} accounts loaded\n`);

    const owner = (code: number | null | undefined) => code != null ? (spMap.get(code) || adminUser.id) : adminUser.id;
    const acc = (cardCode: string | null) => cardCode ? (accMap.get(cardCode) || null) : null;
    const currency = COMPANIES[TARGET_COMPANY].currency;

    // --- ORDERS ---
    const existingOrders = await prisma.order.count();
    if (existingOrders > 0) {
        console.log(`🛒 Orders: ${existingOrders} already exist, skipping.\n`);
    } else {
        console.log('🛒 Fetching Orders...');
        const orders = await sapGet('Orders', {
            $select: 'DocEntry,DocNum,CardCode,DocTotal,DocDate,DocumentStatus,SalesPersonCode',
            $orderby: 'DocDate desc',
        });
        console.log(`   Found ${orders.length} orders, inserting in batches of ${BATCH_SIZE}...`);

        let orderCount = 0;
        const orderBatch: any[] = [];
        for (const o of orders) {
            const accountId = acc(o.CardCode);
            if (!accountId) continue;
            orderBatch.push({
                orderNumber: `ORD-${o.DocNum}`,
                sapOrderId: o.DocEntry?.toString(),
                totalAmount: Number(o.DocTotal) || 0,
                currency,
                status: o.DocumentStatus === 'bost_Close' ? 'DELIVERED' : 'PROCESSING',
                accountId,
                ownerId: owner(o.SalesPersonCode),
                createdAt: o.DocDate ? new Date(o.DocDate) : new Date(),
                updatedAt: new Date(),
            });

            if (orderBatch.length >= BATCH_SIZE) {
                const result = await prisma.order.createMany({ data: orderBatch, skipDuplicates: true });
                orderCount += result.count;
                console.log(`      ... ${orderCount} inserted`);
                orderBatch.length = 0;
            }
        }
        if (orderBatch.length > 0) {
            const result = await prisma.order.createMany({ data: orderBatch, skipDuplicates: true });
            orderCount += result.count;
        }
        console.log(`   ✅ Synced ${orderCount} orders\n`);
    }

    // --- INVOICES ---
    const existingInvoices = await prisma.invoice.count();
    if (existingInvoices > 0) {
        console.log(`🧾 Invoices: ${existingInvoices} already exist, skipping.\n`);
    } else {
        console.log('🧾 Fetching Invoices...');
        const invoices = await sapGet('Invoices', {
            $select: 'DocEntry,DocNum,CardCode,DocTotal,DocDate,DocDueDate,PaidToDate',
            $orderby: 'DocDate desc',
        });
        console.log(`   Found ${invoices.length} invoices, inserting in batches...`);

        let invoiceCount = 0;
        const invBatch: any[] = [];
        for (const inv of invoices) {
            const accountId = acc(inv.CardCode);
            if (!accountId) continue;
            const amount = Number(inv.DocTotal) || 0;
            const paid = Number(inv.PaidToDate) || 0;
            const dueDate = inv.DocDueDate ? new Date(inv.DocDueDate) : new Date();
            let status: string;
            if (paid >= amount && amount > 0) status = 'PAID';
            else if (paid > 0) status = 'PARTIAL';
            else if (dueDate < new Date()) status = 'OVERDUE';
            else status = 'UNPAID';

            invBatch.push({
                invoiceNumber: `INV-${inv.DocNum}`,
                sapInvoiceId: inv.DocEntry?.toString(),
                amount, status, dueDate,
                paidDate: status === 'PAID' ? new Date() : null,
                accountId,
                createdAt: inv.DocDate ? new Date(inv.DocDate) : new Date(),
                updatedAt: new Date(),
            });

            if (invBatch.length >= BATCH_SIZE) {
                const result = await prisma.invoice.createMany({ data: invBatch, skipDuplicates: true });
                invoiceCount += result.count;
                console.log(`      ... ${invoiceCount} inserted`);
                invBatch.length = 0;
            }
        }
        if (invBatch.length > 0) {
            const result = await prisma.invoice.createMany({ data: invBatch, skipDuplicates: true });
            invoiceCount += result.count;
        }
        console.log(`   ✅ Synced ${invoiceCount} invoices\n`);
    }

    // --- ACTIVITIES ---
    const existingActivities = await prisma.activity.count();
    if (existingActivities > 0) {
        console.log(`📅 Activities: ${existingActivities} already exist, skipping.\n`);
    } else {
        console.log('📅 Fetching Activities...');
        const activities = await sapGet('Activities', {
            $select: 'ActivityCode,ActivityType,Subject,ActivityDate,CloseDate,Status,CardCode,HandledBy',
            $orderby: 'ActivityDate desc',
        });
        console.log(`   Found ${activities.length} activities, inserting in batches...`);

        const actTypeMap: Record<number, string> = { [-1]: 'Task', 0: 'Call', 1: 'Meeting', 2: 'Task', 3: 'Note', 4: 'Email' };
        const actStatusMap: Record<string, string> = { cn_Open: 'Planned', cn_Closed: 'Completed', cn_Cancel: 'Cancelled' };

        let activityCount = 0;
        const actBatch: any[] = [];
        for (const act of activities) {
            const accountId = acc(act.CardCode);
            actBatch.push({
                activityType: actTypeMap[act.ActivityType] || 'Task',
                subject: String(act.Subject || `Activity ${act.ActivityCode}`),
                dueDate: act.ActivityDate ? new Date(act.ActivityDate) : null,
                status: actStatusMap[act.Status] || 'Planned',
                accountId,
                ownerId: owner(act.HandledBy),
                isCompleted: act.Status === 'cn_Closed',
                completedAt: act.Status === 'cn_Closed' && act.CloseDate ? new Date(act.CloseDate) : null,
                createdAt: act.ActivityDate ? new Date(act.ActivityDate) : new Date(),
                updatedAt: new Date(),
            });

            if (actBatch.length >= BATCH_SIZE) {
                const result = await prisma.activity.createMany({ data: actBatch, skipDuplicates: true });
                activityCount += result.count;
                console.log(`      ... ${activityCount} inserted`);
                actBatch.length = 0;
            }
        }
        if (actBatch.length > 0) {
            const result = await prisma.activity.createMany({ data: actBatch, skipDuplicates: true });
            activityCount += result.count;
        }
        console.log(`   ✅ Synced ${activityCount} activities\n`);
    }

    console.log('═══════════════════════════════════');
    console.log('✅ Remaining seed complete!');
    console.log('═══════════════════════════════════');
}

main()
    .catch((e) => { console.error('❌ Failed:', e.message || e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); await pool.end(); });
