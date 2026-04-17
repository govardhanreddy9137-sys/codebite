import fs from 'fs';

async function run() {
    try {
        console.log('Logging in as rider...');
        const loginRes = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'rider1@codebite.com', password: 'rider123' })
        });
        
        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);
        
        if (!loginData.ok) {
            return;
        }

        const token = loginData.token;
        console.log('Fetching available orders...');
        const ordersRes = await fetch('http://localhost:3002/api/riders/available', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Available Orders Status:', ordersRes.status);
        const ordersText = await ordersRes.text();
        console.log('Available Orders Body:', ordersText);

        const assignedRes = await fetch('http://localhost:3002/api/riders/assigned', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Assigned Status:', assignedRes.status);
        console.log('Assigned Body:', await assignedRes.text());
        
    } catch (e) {
        console.error('Error:', e);
    }
}
run();
