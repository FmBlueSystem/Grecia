import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const EXCEL_PATH = '/Users/freddymolina/Downloads/Data para pantalla de demostración.xlsx';

function excelDateToJSDate(serial: number): Date {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
}

async function main() {
    console.log('🌱 Seeding database from Excel...');

    if (!fs.existsSync(EXCEL_PATH)) {
        console.error(`❌ File not found: ${EXCEL_PATH}`);
        process.exit(1);
    }

    // 1. Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: { name: 'Admin', isSystem: true, permissions: {} },
    });

    const salesRole = await prisma.role.upsert({
        where: { name: 'Sales Representative' },
        update: {},
        create: { name: 'Sales Representative', isSystem: false, permissions: {} },
    });

    // 2. Default Admin User
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'freddy@bluesystem.com' },
        update: {},
        create: {
            email: 'freddy@bluesystem.com',
            password: passwordHash,
            firstName: 'Freddy',
            lastName: 'Molina',
            roleId: adminRole.id,
        },
    });

    // 3. Read Excel
    const workbook = XLSX.readFile(EXCEL_PATH);

    // Cache for IDs
    const userMap = new Map<string, string>(); // Name -> ID
    const accountMap = new Map<string, string>(); // Name -> ID
    const productMap = new Map<string, string>(); // Name -> ID

    userMap.set('Freddy Molina', adminUser.id); // Alias

    // Helper to get or create user
    const getOwnerId = async (name: string) => {
        if (!name) return adminUser.id;
        const normalized = name.trim();
        if (userMap.has(normalized)) return userMap.get(normalized)!;

        // Create new user (simple logic)
        const parts = normalized.split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || 'User';
        const email = `${firstName.toLowerCase()}.${lastName.replace(/\s/g, '').toLowerCase()}@stia.com`;

        const newUser = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: passwordHash,
                firstName,
                lastName,
                roleId: salesRole.id,
            }
        });
        userMap.set(normalized, newUser.id);
        console.log(`   👤 Created User: ${normalized}`);
        return newUser.id;
    };

    // Helper to get or create account
    const getAccountId = async (name: string, country: string) => {
        if (!name) return null;
        const normalized = name.trim();
        if (accountMap.has(normalized)) return accountMap.get(normalized)!;

        const account = await prisma.account.create({
            data: {
                name: normalized,
                country: country || 'Costa Rica',
                ownerId: adminUser.id,
                isActive: true,
            }
        });
        accountMap.set(normalized, account.id);
        return account.id;
    };

    // Helper to get or create product
    const getProductId = async (name: string, category: string, price: number = 0) => {
        if (!name) return null;
        const normalized = name.trim();
        if (productMap.has(normalized)) return productMap.get(normalized)!;

        // Generate a fake code
        const code = `ITM-${Math.floor(Math.random() * 100000)}`;

        const product = await prisma.product.create({
            data: {
                name: normalized,
                code: code,
                category: category || 'General',
                price: price || 100,
            }
        });
        productMap.set(normalized, product.id);
        return product.id;
    };


    // --- PROCESS: Vencimiento Ofertas (Quotes) ---
    const quotesSheet = workbook.Sheets['Vencimiento Ofertas'];
    if (quotesSheet) {
        console.log('Processing Quotes...');
        const rows = XLSX.utils.sheet_to_json<any>(quotesSheet);

        for (const row of rows) {
            // Row: Fecha, Oferta, Cliente, Categoría, Producto, Vendedor, País, Fecha de vencimiento/ cierre, Monto ($)
            const ownerId = await getOwnerId(row['Vendedor']);
            const accountId = await getAccountId(row['Cliente'], row['País']);
            if (!accountId) continue;
            const productId = await getProductId(row['Producto'], row['Categoría'], row['Monto ($)']);

            const quoteNum = `QT-${row['Oferta']}`;

            // Create Quote
            await prisma.quote.create({
                data: {
                    quoteNumber: quoteNum,
                    name: `Oferta ${row['Producto']}`,
                    totalAmount: Number(row['Monto ($)']) || 0,
                    status: 'SENT',
                    expirationDate: typeof row['Fecha de vencimiento/ cierre'] === 'number'
                        ? excelDateToJSDate(row['Fecha de vencimiento/ cierre'])
                        : new Date(),
                    accountId,
                    contactId: null,
                    ownerId,
                    items: productId ? {
                        create: [{
                            productId,
                            quantity: 1,
                            unitPrice: Number(row['Monto ($)']) || 0,
                            totalPrice: Number(row['Monto ($)']) || 0,
                        }]
                    } : undefined
                }
            }).catch(e => console.warn(`Skipping duplicate quote ${quoteNum}`));
        }
    }


    // --- PROCESS: Cuentas por cobrar (Invoices) ---
    const invoicesSheet = workbook.Sheets['Cuentas por cobrar'];
    if (invoicesSheet) {
        console.log('Processing Invoices...');
        const rows = XLSX.utils.sheet_to_json<any>(invoicesSheet);

        for (const row of rows) {
            // Row: Fecha, Factura, Cliente, Categoría, Producto, Vendedor, País, Monto ($), Fecha de vencimiento/ cierre
            const ownerId = await getOwnerId(row['Vendedor']);
            const accountId = await getAccountId(row['Cliente'], row['País']);
            if (!accountId) continue;

            const invNum = `INV-${row['Factura']}`;
            const amount = Number(row['Monto ($)']) || 0;
            const dueDate = typeof row['Fecha de vencimiento/ cierre'] === 'number'
                ? excelDateToJSDate(row['Fecha de vencimiento/ cierre'])
                : new Date();

            // Determine status
            const now = new Date();
            const status = dueDate < now ? 'OVERDUE' : 'UNPAID';

            await prisma.invoice.create({
                data: {
                    invoiceNumber: invNum,
                    amount,
                    status,
                    dueDate,
                    accountId,
                    // Note: Invoice model in schema doesn't have ownerId?
                    // Checking schema... Invoice model: accountId, no ownerId. 
                    // Okay, we just link account.
                }
            }).catch(e => console.warn(`Skipping duplicate invoice ${invNum}`));
        }
    }


    // --- PROCESS: Ofertas perdidas ---
    const lostSchema = workbook.Sheets['Ofertas perdidas'];
    if (lostSchema) {
        console.log('Processing Lost Quotes...');
        const rows = XLSX.utils.sheet_to_json<any>(lostSchema);

        for (const row of rows) {
            // Row: Fecha, Cliente, Categoría, Producto, Vendedor, País, Monto ($), Motivo
            const ownerId = await getOwnerId(row['Vendedor']);
            const accountId = await getAccountId(row['Cliente'], row['País']);
            if (!accountId) continue;
            const productId = await getProductId(row['Producto'], row['Categoría']);

            const quoteNum = `QT-LOST-${Math.floor(Math.random() * 1000000)}`;

            await prisma.quote.create({
                data: {
                    quoteNumber: quoteNum,
                    name: `Oferta Perdida - ${row['Producto']}`,
                    totalAmount: Number(row['Monto ($)']) || 0,
                    status: 'REJECTED',
                    expirationDate: new Date(), // Past
                    lossReason: row['Motivo'],
                    accountId,
                    ownerId,
                    items: productId ? {
                        create: [{
                            productId,
                            quantity: 1,
                            unitPrice: Number(row['Monto ($)']) || 0,
                            totalPrice: Number(row['Monto ($)']) || 0,
                        }]
                    } : undefined
                }
            });
        }
    }

    // --- PROCESS: Ventas (Historical Orders) ---
    const salesSheet = workbook.Sheets['Ventas'];
    if (salesSheet) {
        console.log('Processing Sales History...');
        const rows = XLSX.utils.sheet_to_json<any>(salesSheet);

        // Month map
        const months: Record<string, number> = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
            'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
        };

        for (const row of rows) {
            // Row: Fecha (Month name), País, Clasificación, Venta 2025
            // We create a dummy order for this.
            // Owner: Admin (since no vendor specified)

            const monthStr = (row['Fecha'] || '').trim();
            const monthIndex = months[Object.keys(months).find(m => monthStr.includes(m)) || ''];

            if (monthIndex === undefined) continue;

            const year = 2025;
            const date = new Date(year, monthIndex, 15); // Mid-month

            const amount = Number(row['Venta 2025']) || 0;
            const category = row['Clasificación'];
            const country = row['País'];

            // We need an account for this country. We'll find one or create a dummy "Ventas Generales [País]"
            let account = await prisma.account.findFirst({ where: { country } });
            if (!account) {
                account = await prisma.account.create({
                    data: {
                        name: `Clientes Generales ${country}`,
                        country,
                        ownerId: adminUser.id
                    }
                });
            }

            // Create Order
            await prisma.order.create({
                data: {
                    orderNumber: `ORD-HIST-${Math.floor(Math.random() * 10000000)}`,
                    totalAmount: amount,
                    status: 'DELIVERED', // Completed sale
                    logisticsStatus: 'Entregado',
                    accountId: account.id,
                    ownerId: adminUser.id,
                    createdAt: date,
                    updatedAt: date,
                    // No items, just total amount for chart
                }
            });
        }
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

