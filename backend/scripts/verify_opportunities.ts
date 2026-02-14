import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';

async function main() {
    console.log('🚀 Starting Opportunities Verification...');

    // 1. Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'freddy@bluesystem.com', password: 'password123' }),
    });

    if (!loginRes.ok) throw new Error(`Login Failed: ${await loginRes.text()}`);
    const { token, user } = await loginRes.json();
    console.log('✅ Login Successful');

    // 2. Create Opportunity (with New Account Auto-creation)
    console.log('\n➕ Testing POST /opportunities (Auto Account Creation)...');
    const newOpp = {
        name: 'Big Deal Q1',
        amount: 50000,
        currency: 'USD',
        stage: 'Prospecting',
        probability: 10,
        closeDate: '2026-03-30',
        accountName: 'Mega Corp Inc.', // New Account
        contactName: 'Freddy Molina', // Existing Contact (created by seed or previous test?) 
        // Wait, seed created User, verify_api created 'Juan Pérez'. 
        // Let's use 'Juan Pérez' to test linking.
        ownerId: user.id
    };

    // Attempt to link to 'Juan Pérez' created in previous steps if exists, or just test logic.
    // Actually, let's create a contact first to be sure.
    const contactRes = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            firstName: 'Test',
            lastName: 'Linker',
            ownerId: user.id
        })
    });
    if (contactRes.ok) console.log('✅ Pre-requisite Contact Created');

    // Now create opp with that contact name
    newOpp.contactName = 'Test Linker';

    const createRes = await fetch(`${BASE_URL}/opportunities`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOpp),
    });

    if (!createRes.ok) {
        console.error('❌ Create Opportunity Failed:', await createRes.text());
        process.exit(1);
    }

    const createdOpp = await createRes.json();
    console.log('✅ Create Opportunity Successful');
    console.log(`   ID: ${createdOpp.data.id}`);
    console.log(`   Account ID (resolved): ${createdOpp.data.accountId}`);

    if (!createdOpp.data.contactId) {
        console.warn('⚠️ Warning: Contact was NOT linked. Check resolution logic.');
    } else {
        console.log(`   Contact ID (resolved): ${createdOpp.data.contactId}`);
    }

    // 3. List Opportunities
    console.log('\n📋 Testing GET /opportunities...');
    const listRes = await fetch(`${BASE_URL}/opportunities`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const listData = await listRes.json();
    console.log(`✅ GET Opportunities Successful. Count: ${listData.total}`);

    // 4. Validate Transformation
    const first = listData.data.find((o: any) => o.id === createdOpp.data.id);
    if (first.accountName === 'Mega Corp Inc.' && first.contactName === 'Test Linker') {
        console.log('✅ Transformation Verified (accountName/contactName present)');
    } else {
        console.error('❌ Transformation Failed:', first);
        process.exit(1);
    }

    console.log('\n✨ All Tests Passed!');
}

main().catch(console.error);
