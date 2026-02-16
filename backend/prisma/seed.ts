import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';
import https from 'https';
import { CountryCode, COMPANIES, DEFAULT_COMPANY } from '../src/config/companies';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// SAP Service Layer config
const SAP_BASE_URL = 'https://sap-stiacmzdr-sl.skyinone.net:50000/b1s/v1';
const SAP_USER = process.env.SAP_USER || 'stifmolina2';
const SAP_PASSWORD = process.env.SAP_PASSWORD || 'FmDiosMio1';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Target company for seed (default: CR)
const TARGET_COMPANY = (process.env.SEED_COMPANY as CountryCode) || DEFAULT_COMPANY;
const PAGE_SIZE = 50;

let sessionId = '';

async function sapLogin(): Promise<string> {
    const company = COMPANIES[TARGET_COMPANY];
    const res = await axios.post(`${SAP_BASE_URL}/Login`, {
        CompanyDB: company.dbName,
        UserName: SAP_USER,
        Password: SAP_PASSWORD,
    }, { httpsAgent });
    sessionId = res.data.SessionId;
    console.log(`[SAP] Logged in to ${company.name} (${company.dbName})`);
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
                headers: {
                    Cookie: `B1SESSION=${sessionId}`,
                    Prefer: `odata.maxpagesize=${PAGE_SIZE}`,
                },
                httpsAgent,
            });
            const data = res.data;
            if (data.value) results.push(...data.value);
            url = data['odata.nextLink']
                ? `${SAP_BASE_URL}/${data['odata.nextLink']}`
                : null;
        } catch (err: any) {
            const sapError = err.response?.data?.error?.message?.value || err.message;
            console.error(`   [SAP ERROR] ${endpoint}: ${sapError}`);
            throw err;
        }
    }
    return results;
}

async function main() {
    console.log('🌱 Seeding database from SAP Service Layer...');
    console.log(`   Company: ${COMPANIES[TARGET_COMPANY].name} (${TARGET_COMPANY})\n`);

    // 0. Login to SAP
    await sapLogin();

    // 1. Roles (5 niveles de scope) + Regiones + Admin User
    console.log('🔐 Creating roles and regions...');

    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: { scopeLevel: 'ALL' },
        create: { name: 'Admin', isSystem: true, permissions: {}, scopeLevel: 'ALL', description: 'Acceso total al sistema' },
    });

    const regionalRole = await prisma.role.upsert({
        where: { name: 'Regional' },
        update: { scopeLevel: 'REGION' },
        create: { name: 'Regional', isSystem: false, permissions: {}, scopeLevel: 'REGION', description: 'Ve todos los países de su región' },
    });

    const gerenteRole = await prisma.role.upsert({
        where: { name: 'Gerente' },
        update: { scopeLevel: 'COUNTRY' },
        create: { name: 'Gerente', isSystem: false, permissions: {}, scopeLevel: 'COUNTRY', description: 'Ve todo el país asignado' },
    });

    const supervisorRole = await prisma.role.upsert({
        where: { name: 'Supervisor' },
        update: { scopeLevel: 'TEAM' },
        create: { name: 'Supervisor', isSystem: false, permissions: {}, scopeLevel: 'TEAM', description: 'Ve los datos de sus vendedores' },
    });

    const salesRole = await prisma.role.upsert({
        where: { name: 'Vendedor' },
        update: { scopeLevel: 'OWN' },
        create: { name: 'Vendedor', isSystem: false, permissions: {}, scopeLevel: 'OWN', description: 'Solo ve sus propios clientes y documentos' },
    });

    console.log('   ✅ Roles: Admin(ALL), Regional(REGION), Gerente(COUNTRY), Supervisor(TEAM), Vendedor(OWN)');

    // Regions
    const regionCA = await prisma.region.upsert({
        where: { name: 'Centroamérica' },
        update: { countries: ['CR', 'GT', 'SV', 'HN', 'PA'] },
        create: { name: 'Centroamérica', countries: ['CR', 'GT', 'SV', 'HN', 'PA'] },
    });
    console.log(`   ✅ Región: ${regionCA.name} (${regionCA.countries.join(', ')})`);

    const passwordHash = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'freddy@bluesystem.com' },
        update: { roleId: adminRole.id },
        create: {
            email: 'freddy@bluesystem.com',
            password: passwordHash,
            firstName: 'Freddy',
            lastName: 'Molina',
            roleId: adminRole.id,
            regionId: regionCA.id,
        },
    });
    console.log(`   ✅ Admin: ${adminUser.email}\n`);

    // 2. SalesPersons → Users (Vendedores)
    console.log('👥 Fetching SalesPersons (Vendedores)...');
    const salesPersons = await sapGet('SalesPersons', {
        $select: 'SalesEmployeeCode,SalesEmployeeName,Active',
    });
    console.log(`   Found ${salesPersons.length} sales persons in SAP`);

    const salesPersonMap = new Map<number, string>(); // SalesPersonCode → userId
    salesPersonMap.set(-1, adminUser.id); // Default/unassigned → admin
    let spCount = 0;
    for (const sp of salesPersons) {
        const code = sp.SalesEmployeeCode;
        const fullName = (sp.SalesEmployeeName || '').trim();
        if (!fullName) continue;

        const parts = fullName.split(' ');
        const firstName = parts[0] || 'User';
        const lastName = parts.slice(1).join(' ') || `SP${code}`;
        const email = `${firstName.toLowerCase()}.${lastName.replace(/\s/g, '').toLowerCase()}@stia.com`;

        try {
            const user = await prisma.user.upsert({
                where: { email },
                update: {
                    isActive: sp.Active === 'tYES' || sp.Active === 'Y',
                    sapSalesPersonCode: code,
                },
                create: {
                    email,
                    password: passwordHash,
                    firstName,
                    lastName,
                    roleId: salesRole.id,
                    country: TARGET_COMPANY,
                    sapSalesPersonCode: code,
                    isActive: sp.Active === 'tYES' || sp.Active === 'Y',
                },
            });
            salesPersonMap.set(code, user.id);
            spCount++;
            console.log(`   👤 ${fullName} → ${email}`);
        } catch (e: any) {
            console.warn(`   ⚠️ Skipping sales person ${fullName}: ${e.message?.slice(0, 60)}`);
            salesPersonMap.set(code, adminUser.id);
        }
    }
    console.log(`   ✅ Synced ${spCount} sales persons\n`);

    // Helper: resolve owner by SalesPersonCode
    const resolveOwner = (salesPersonCode: number | null | undefined): string => {
        if (salesPersonCode == null) return adminUser.id;
        return salesPersonMap.get(salesPersonCode) || adminUser.id;
    };

    // 3. Business Partners → Accounts + Contacts
    console.log('🏢 Fetching Business Partners (Customers + Contacts)...');
    const bps = await sapGet('BusinessPartners', {
        $filter: "CardType eq 'C'",
        $select: 'CardCode,CardName,Phone1,Website,Country,Industry,Valid,SalesPersonCode,ContactEmployees',
    });
    console.log(`   Found ${bps.length} customers in SAP`);

    const accountMap = new Map<string, string>(); // CardCode → accountId
    let accountCount = 0;
    for (const bp of bps) {
        try {
            const account = await prisma.account.upsert({
                where: { id: bp.CardCode }, // We'll use sapId for lookup
                update: {
                    name: bp.CardName || bp.CardCode,
                    phone: bp.Phone1 || null,
                    website: bp.Website || null,
                    country: bp.Country || COMPANIES[TARGET_COMPANY].name,
                    industry: bp.Industry?.toString() || null,
                    isActive: bp.Valid === 'Y' || bp.Valid === 'tYES',
                },
                create: {
                    name: bp.CardName || bp.CardCode,
                    sapId: bp.CardCode,
                    phone: bp.Phone1 || null,
                    website: bp.Website || null,
                    country: bp.Country || COMPANIES[TARGET_COMPANY].name,
                    industry: bp.Industry?.toString() || null,
                    isActive: bp.Valid === 'Y' || bp.Valid === 'tYES',
                    ownerId: resolveOwner(bp.SalesPersonCode),
                },
            });
            accountMap.set(bp.CardCode, account.id);
            accountCount++;
        } catch {
            // Upsert by id won't work, try findFirst by sapId
            let account = await prisma.account.findFirst({ where: { sapId: bp.CardCode } });
            if (!account) {
                account = await prisma.account.create({
                    data: {
                        name: bp.CardName || bp.CardCode,
                        sapId: bp.CardCode,
                        phone: bp.Phone1 || null,
                        website: bp.Website || null,
                        country: bp.Country || COMPANIES[TARGET_COMPANY].name,
                        industry: bp.Industry?.toString() || null,
                        isActive: bp.Valid === 'Y' || bp.Valid === 'tYES',
                        ownerId: resolveOwner(bp.SalesPersonCode),
                    },
                });
            }
            accountMap.set(bp.CardCode, account.id);
            accountCount++;
        }
    }
    console.log(`   ✅ Synced ${accountCount} accounts\n`);

    // 3b. ContactEmployees → Contacts (from BP data already fetched)
    console.log('👤 Processing Contact Persons (from BP data)...');
    let contactCount = 0;
    for (const bp of bps) {
        const accountId = accountMap.get(bp.CardCode);
        if (!accountId) continue;

        const contacts = bp.ContactEmployees || [];
        for (const cp of contacts) {
            if (!cp.Name) continue;
            const parts = cp.Name.trim().split(' ');
            const firstName = parts[0] || 'Contact';
            const lastName = parts.slice(1).join(' ') || bp.CardName || '';

            try {
                await prisma.contact.create({
                    data: {
                        firstName,
                        lastName,
                        email: cp.E_Mail || null,
                        phone: cp.Phone1 || null,
                        mobile: cp.MobilePhone || null,
                        jobTitle: cp.Position || null,
                        accountId,
                        ownerId: resolveOwner(bp.SalesPersonCode),
                        isActive: cp.Active === 'tYES' || cp.Active === 'Y',
                    },
                });
                contactCount++;
            } catch {
                // skip duplicates
            }
        }
    }
    console.log(`   ✅ Synced ${contactCount} contacts\n`);

    // Helper: resolve account by CardCode
    const resolveAccount = async (cardCode: string | null): Promise<string | null> => {
        if (!cardCode) return null;
        if (accountMap.has(cardCode)) return accountMap.get(cardCode)!;
        // Try to find in DB
        const acc = await prisma.account.findFirst({ where: { sapId: cardCode } });
        if (acc) {
            accountMap.set(cardCode, acc.id);
            return acc.id;
        }
        // Create minimal account
        const newAcc = await prisma.account.create({
            data: {
                name: cardCode,
                sapId: cardCode,
                country: COMPANIES[TARGET_COMPANY].name,
                ownerId: adminUser.id,
            },
        });
        accountMap.set(cardCode, newAcc.id);
        return newAcc.id;
    };

    // 3. Items → Products
    console.log('📦 Fetching Items...');
    const items = await sapGet('Items', {
        $select: 'ItemCode,ItemName,ItemsGroupCode,Frozen',
    });
    console.log(`   Found ${items.length} items in SAP`);

    const productMap = new Map<string, string>(); // ItemCode → productId
    let productCount = 0;
    for (const item of items) {
        try {
            const product = await prisma.product.upsert({
                where: { code: item.ItemCode },
                update: {
                    name: item.ItemName || item.ItemCode,
                    isActive: item.Frozen !== 'tYES' && item.Frozen !== 'Y',
                },
                create: {
                    code: item.ItemCode,
                    name: item.ItemName || item.ItemCode,
                    category: item.ItemsGroupCode?.toString() || 'General',
                    price: 0,
                    currency: COMPANIES[TARGET_COMPANY].currency,
                    isActive: item.Frozen !== 'tYES' && item.Frozen !== 'Y',
                },
            });
            productMap.set(item.ItemCode, product.id);
            productCount++;
        } catch (e: any) {
            console.warn(`   ⚠️ Skipping item ${item.ItemCode}: ${e.message?.slice(0, 80)}`);
        }
    }
    console.log(`   ✅ Synced ${productCount} products\n`);

    // Helper: resolve product
    const resolveProduct = async (itemCode: string | null): Promise<string | null> => {
        if (!itemCode) return null;
        if (productMap.has(itemCode)) return productMap.get(itemCode)!;
        const prod = await prisma.product.findUnique({ where: { code: itemCode } });
        if (prod) {
            productMap.set(itemCode, prod.id);
            return prod.id;
        }
        return null;
    };

    // 4. Quotations → Quotes
    console.log('📝 Fetching Quotations...');
    const quotations = await sapGet('Quotations', {
        $select: 'DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode,DocumentLines',
        $orderby: 'DocDate desc',
    });
    console.log(`   Found ${quotations.length} quotations in SAP`);

    let quoteCount = 0;
    for (const q of quotations) {
        const accountId = await resolveAccount(q.CardCode);
        if (!accountId) continue;

        const quoteNumber = `QT-${q.DocNum}`;
        const status = q.DocumentStatus === 'bost_Close' ? 'ACCEPTED'
            : q.DocumentStatus === 'bost_Open' ? 'SENT' : 'DRAFT';

        try {
            const quote = await prisma.quote.upsert({
                where: { quoteNumber },
                update: {
                    totalAmount: Number(q.DocTotal) || 0,
                    status,
                },
                create: {
                    quoteNumber,
                    name: `${q.CardName || q.CardCode} - ${quoteNumber}`,
                    totalAmount: Number(q.DocTotal) || 0,
                    currency: COMPANIES[TARGET_COMPANY].currency,
                    status,
                    expirationDate: q.DocDueDate ? new Date(q.DocDueDate) : null,
                    accountId,
                    ownerId: resolveOwner(q.SalesPersonCode),
                },
            });

            // Insert line items
            const lines = q.DocumentLines || [];
            for (const line of lines) {
                const productId = await resolveProduct(line.ItemCode);
                if (!productId) continue;
                // Check if item already exists
                const existing = await prisma.quoteItem.findFirst({
                    where: { quoteId: quote.id, productId },
                });
                if (!existing) {
                    await prisma.quoteItem.create({
                        data: {
                            quoteId: quote.id,
                            productId,
                            quantity: Number(line.Quantity) || 1,
                            unitPrice: Number(line.UnitPrice) || Number(line.Price) || 0,
                            totalPrice: Number(line.LineTotal) || 0,
                            discount: Number(line.DiscountPercent) || 0,
                        },
                    });
                }
            }
            quoteCount++;
        } catch (e: any) {
            console.warn(`   ⚠️ Skipping quote ${quoteNumber}: ${e.message?.slice(0, 80)}`);
        }
    }
    console.log(`   ✅ Synced ${quoteCount} quotes\n`);

    // 5. Orders → Orders
    console.log('🛒 Fetching Orders...');
    const orders = await sapGet('Orders', {
        $select: 'DocEntry,DocNum,CardCode,CardName,DocTotal,DocDate,DocDueDate,DocumentStatus,SalesPersonCode,DocumentLines',
        $orderby: 'DocDate desc',
    });
    console.log(`   Found ${orders.length} orders in SAP`);

    let orderCount = 0;
    for (const o of orders) {
        const accountId = await resolveAccount(o.CardCode);
        if (!accountId) continue;

        const orderNumber = `ORD-${o.DocNum}`;
        const status = o.DocumentStatus === 'bost_Close' ? 'DELIVERED' : 'PROCESSING';

        try {
            const order = await prisma.order.upsert({
                where: { orderNumber },
                update: {
                    totalAmount: Number(o.DocTotal) || 0,
                    status,
                },
                create: {
                    orderNumber,
                    sapOrderId: o.DocEntry?.toString(),
                    totalAmount: Number(o.DocTotal) || 0,
                    currency: COMPANIES[TARGET_COMPANY].currency,
                    status,
                    accountId,
                    ownerId: resolveOwner(o.SalesPersonCode),
                    createdAt: o.DocDate ? new Date(o.DocDate) : new Date(),
                },
            });

            const lines = o.DocumentLines || [];
            for (const line of lines) {
                const productId = await resolveProduct(line.ItemCode);
                if (!productId) continue;
                const existing = await prisma.orderItem.findFirst({
                    where: { orderId: order.id, productId },
                });
                if (!existing) {
                    await prisma.orderItem.create({
                        data: {
                            orderId: order.id,
                            productId,
                            quantity: Number(line.Quantity) || 1,
                            unitPrice: Number(line.UnitPrice) || Number(line.Price) || 0,
                            totalPrice: Number(line.LineTotal) || 0,
                            discount: Number(line.DiscountPercent) || 0,
                        },
                    });
                }
            }
            orderCount++;
        } catch (e: any) {
            console.warn(`   ⚠️ Skipping order ${orderNumber}: ${e.message?.slice(0, 80)}`);
        }
    }
    console.log(`   ✅ Synced ${orderCount} orders\n`);

    // 6. Invoices → Invoices
    console.log('🧾 Fetching Invoices...');
    const invoices = await sapGet('Invoices', {
        $select: 'DocEntry,DocNum,CardCode,DocTotal,DocDate,DocDueDate,DocumentStatus,PaidToDate',
        $orderby: 'DocDate desc',
    });
    console.log(`   Found ${invoices.length} invoices in SAP`);

    let invoiceCount = 0;
    for (const inv of invoices) {
        const accountId = await resolveAccount(inv.CardCode);
        if (!accountId) continue;

        const invoiceNumber = `INV-${inv.DocNum}`;
        const amount = Number(inv.DocTotal) || 0;
        const paid = Number(inv.PaidToDate) || 0;
        const dueDate = inv.DocDueDate ? new Date(inv.DocDueDate) : new Date();

        let status: string;
        if (paid >= amount) status = 'PAID';
        else if (paid > 0) status = 'PARTIAL';
        else if (dueDate < new Date()) status = 'OVERDUE';
        else status = 'UNPAID';

        try {
            await prisma.invoice.upsert({
                where: { invoiceNumber },
                update: { amount, status },
                create: {
                    invoiceNumber,
                    sapInvoiceId: inv.DocEntry?.toString(),
                    amount,
                    status,
                    dueDate,
                    paidDate: status === 'PAID' ? new Date() : null,
                    accountId,
                    createdAt: inv.DocDate ? new Date(inv.DocDate) : new Date(),
                },
            });
            invoiceCount++;
        } catch (e: any) {
            console.warn(`   ⚠️ Skipping invoice ${invoiceNumber}: ${e.message?.slice(0, 80)}`);
        }
    }
    console.log(`   ✅ Synced ${invoiceCount} invoices\n`);

    // 7. Activities
    console.log('📅 Fetching Activities...');
    const activities = await sapGet('Activities', {
        $select: 'ActivityCode,ActivityType,Subject,Notes,StartDate,EndDate,Status,CardCode,HandledBy',
        $orderby: 'StartDate desc',
    });
    console.log(`   Found ${activities.length} activities in SAP`);

    const actTypeMap: Record<number, string> = {
        [-1]: 'Task', 0: 'Call', 1: 'Meeting', 2: 'Task', 3: 'Note', 4: 'Email',
    };
    const actStatusMap: Record<string, string> = {
        'cn_Open': 'Planned', 'cn_Closed': 'Completed', 'cn_Cancel': 'Cancelled',
    };
    let activityCount = 0;
    for (const act of activities) {
        const accountId = await resolveAccount(act.CardCode);
        const ownerId = resolveOwner(act.HandledBy);

        try {
            await prisma.activity.create({
                data: {
                    activityType: actTypeMap[act.ActivityType] || 'Task',
                    subject: act.Subject || `Activity ${act.ActivityCode}`,
                    description: act.Notes || null,
                    dueDate: act.EndDate ? new Date(act.EndDate) : null,
                    status: actStatusMap[act.Status] || 'Planned',
                    accountId,
                    ownerId,
                    isCompleted: act.Status === 'cn_Closed',
                    completedAt: act.Status === 'cn_Closed' ? new Date(act.EndDate || Date.now()) : null,
                    createdAt: act.StartDate ? new Date(act.StartDate) : new Date(),
                },
            });
            activityCount++;
        } catch {
            // skip
        }
    }
    console.log(`   ✅ Synced ${activityCount} activities\n`);

    // Summary
    console.log('═══════════════════════════════════');
    console.log('✅ Seed complete!');
    console.log(`   Sales Persons: ${spCount}`);
    console.log(`   Accounts:      ${accountCount}`);
    console.log(`   Contacts:      ${contactCount}`);
    console.log(`   Products:      ${productCount}`);
    console.log(`   Quotes:        ${quoteCount}`);
    console.log(`   Orders:        ${orderCount}`);
    console.log(`   Invoices:      ${invoiceCount}`);
    console.log(`   Activities:    ${activityCount}`);
    console.log('═══════════════════════════════════');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e.message || e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
