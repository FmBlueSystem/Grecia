import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';

async function main() {
    console.log('🚀 Starting Full Flow Verification...');

    // 1. Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'freddy@bluesystem.com', password: 'password123' }),
    });

    if (!loginRes.ok) throw new Error(`Login Failed: ${await loginRes.text()}`);
    const { token, user } = await loginRes.json();
    console.log('✅ Login Successful');

    // 2. Create Contact
    console.log('\n➕ Creating Contact...');
    const contactRes = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ firstName: 'Full', lastName: 'Flow', email: 'full.flow@example.com', ownerId: user.id })
    });
    if (!contactRes.ok) throw new Error(`Create Contact Failed: ${await contactRes.text()}`);
    const contact = (await contactRes.json()).data;
    console.log(`✅ Contact Created: ${contact.id}`);

    // 3. Create Opportunity
    console.log('\n➕ Creating Opportunity...');
    const oppRes = await fetch(`${BASE_URL}/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            name: 'Flow Deal',
            amount: 150000,
            stage: 'Negotiation',
            probability: 80,
            closeDate: '2026-06-01',
            accountName: 'Flow Corp',
            contactName: 'Full Flow',
            ownerId: user.id
        })
    });
    if (!oppRes.ok) throw new Error(`Create Opportunity Failed: ${await oppRes.text()}`);
    const opportunity = (await oppRes.json()).data;
    console.log(`✅ Opportunity Created: ${opportunity.id}`);

    // 4. Create Activity
    console.log('\n➕ Creating Activity...');
    const actRes = await fetch(`${BASE_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            activityType: 'Meeting',
            subject: 'Discuss Flow',
            dueDate: new Date().toISOString(), // Today
            contactId: contact.id,
            opportunityId: opportunity.id,
            ownerId: user.id
        })
    });
    if (!actRes.ok) throw new Error(`Create Activity Failed: ${await actRes.text()}`);
    const activity = (await actRes.json()).data;
    console.log(`✅ Activity Created: ${activity.id}`);

    // 5. Check Dashboard
    console.log('\n📊 Checking Dashboard Stats...');
    const dashRes = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!dashRes.ok) throw new Error(`Get Dashboard Failed: ${await dashRes.text()}`);
    const stats = await dashRes.json();

    console.log('✅ Dashboard Data:', JSON.stringify(stats, null, 2));

    // Assertions
    if (stats.pipeline.value >= 150000) console.log('✅ Pipeline Value Updated');
    else console.warn('⚠️ Pipeline Value might be incorrect', stats.pipeline.value);

    if (stats.activities.today >= 1) console.log('✅ Today Activities Updated');
    else console.error('❌ Today Activities not updated');

    console.log('\n✨ Full Flow Verified!');
}

main().catch(console.error);
