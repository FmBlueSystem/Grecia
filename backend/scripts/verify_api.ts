import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';

async function main() {
    console.log('🚀 Starting API Verification...');

    // 1. Login
    console.log('\n🔐 Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'freddy@bluesystem.com', password: 'password123' }),
    });

    if (!loginRes.ok) {
        console.error('❌ Login Failed:', await loginRes.text());
        process.exit(1);
    }

    const loginData = await loginRes.json() as any;
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('✅ Login Successful');
    console.log(`   User ID: ${userId}`);

    // 2. Get Contacts (Empty)
    console.log('\n📋 Testing GET /contacts (Expect Empty)...');
    const getContactsRes = await fetch(`${BASE_URL}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!getContactsRes.ok) {
        console.error('❌ GET Contacts Failed:', await getContactsRes.text());
        process.exit(1);
    }

    const contactsData = await getContactsRes.json() as any;
    console.log(`✅ GET Contacts Successful. Count: ${contactsData.data.length}`);

    // 3. Create Contact
    console.log('\n➕ Testing POST /contacts...');
    const newContact = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@example.com',
        ownerId: userId, // Link to current user
    };

    const createRes = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newContact),
    });

    if (!createRes.ok) {
        console.error('❌ Create Contact Failed:', await createRes.text());
        process.exit(1);
    }

    const createdContact = await createRes.json() as any;
    console.log('✅ Create Contact Successful');
    console.log(`   Contact ID: ${createdContact.data.id}`);

    // 4. Verify Contact Exists
    console.log('\n📋 Testing GET /contacts (Expect 1)...');
    const getContactsRes2 = await fetch(`${BASE_URL}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const contactsData2 = await getContactsRes2.json() as any;
    console.log(`✅ GET Contacts Successful. Count: ${contactsData2.data.length}`);

    if (contactsData2.data.length !== 1) {
        console.error('❌ Expected 1 contact, found', contactsData2.data.length);
        process.exit(1);
    }

    console.log('\n✨ Contact Tests Passed!');

    // 5. Create Account
    console.log('\n🏢 Testing POST /accounts...');
    const newAccount = {
        name: 'Empresa Test S.A.',
        industry: 'Technology',
        ownerId: userId,
    };

    const createAccountRes = await fetch(`${BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAccount),
    });

    if (!createAccountRes.ok) {
        console.error('❌ Create Account Failed:', await createAccountRes.text());
        process.exit(1);
    }

    const createdAccount = await createAccountRes.json() as any;
    console.log('✅ Create Account Successful');
    console.log(`   Account ID: ${createdAccount.data.id}`);

    // 6. Create Invoice
    console.log('\n💰 Testing POST /invoices...');
    const newInvoice = {
        invoiceNumber: 'INV-2024-001',
        amount: 1500.50,
        status: 'UNPAID',
        dueDate: new Date().toISOString(),
        accountId: createdAccount.data.id,
    };

    const createInvoiceRes = await fetch(`${BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInvoice),
    });

    if (!createInvoiceRes.ok) {
        console.error('❌ Create Invoice Failed:', await createInvoiceRes.text());
        process.exit(1);
    }

    const createdInvoice = await createInvoiceRes.json() as any;
    console.log('✅ Create Invoice Successful');

    // 7. Get Invoices & Verify Account Name
    console.log('\n📋 Testing GET /invoices (Expect account data)...');
    const getInvoicesRes = await fetch(`${BASE_URL}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!getInvoicesRes.ok) {
        console.error('❌ GET Invoices Failed:', await getInvoicesRes.text());
        process.exit(1);
    }

    const invoicesData = await getInvoicesRes.json() as any;
    const foundInvoice = invoicesData.data.find((inv: any) => inv.id === createdInvoice.data.id);

    if (foundInvoice && foundInvoice.account && foundInvoice.account.name === 'Empresa Test S.A.') {
        console.log('✅ Invoice verification Passed: Account Name is present.');
    } else {
        console.error('❌ Invoice verification Failed: Account Name missing or incorrect.', foundInvoice);
        process.exit(1);
    }

    console.log('\n✨ All Tests Passed!');
}

main().catch(console.error);
