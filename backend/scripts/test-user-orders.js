import 'dotenv/config';

const test = async () => {
    const baseUrl = 'http://localhost:3001/api';
    const email = `testuser_${Date.now()}@example.com`;
    
    console.log('Registering user...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password: 'password123',
            name: 'Test User'
        })
    });
    const regData = await regRes.json();
    console.log('Register Status:', regRes.status);
    
    if (regData.token) {
        console.log('Fetching orders...');
        const ordersRes = await fetch(`${baseUrl}/orders`, {
            headers: { 'Authorization': `Bearer ${regData.token}` }
        });
        const ordersData = await ordersRes.json();
        console.log('Orders Status:', ordersRes.status);
        console.log('Orders Data:', JSON.stringify(ordersData, null, 2));
    }
};
test();
