// using global fetch
import mongoose from 'mongoose';
import 'dotenv/config';

const myFetch = fetch;

const test = async () => {
    try {
        const baseUrl = 'http://localhost:3001/api';
        
        // 1. Get a rider account (or use the one we found)
        // We'll just use the email of the rider we saw earlier if we remember it, 
        // or we'll look it up.
        // Actually, let's just use the admin to promote a user to rider if needed.
        // But we saw a rider earlier. Let's find their email.
        
        // For simplicity, let's just use the known admin credentials to get a token and then claim 
        // (since admins are also allowed in isRider middleware)
        console.log('Logging in as Admin...');
        const loginRes = await myFetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'govardhan@gmail.com', password: 'govardhan@123' })
        });
        const { token } = await loginRes.json();
        console.log('LoggedIn, token received.');

        // 2. Update an order to 'ready'
        const orderId = '69ae4ed38e70e3acebebfe49'; 
        console.log(`Updating order ${orderId} to ready...`);
        const updateRes = await myFetch(`${baseUrl}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'ready' })
        });
        console.log('Update Status:', updateRes.status);

        // 3. Claim the order
        console.log('Claiming order...');
        const claimRes = await myFetch(`${baseUrl}/rider/${orderId}/claim`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Claim HTTP Status:', claimRes.status);
        const text = await claimRes.text();
        console.log('Claim Raw Response:', text);
        try {
            const claimData = JSON.parse(text);
            console.log('Claim Data:', JSON.stringify(claimData, null, 2));
        } catch (e) {
            console.log('Response was not JSON');
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
};

test();
