const test = async () => {
    try {
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'govardhan@gmail.com', password: 'govardhan@123' })
        });
        const loginData = await loginRes.json();
        console.log('Login Result:', JSON.stringify(loginData, null, 2));

        if (loginData.token) {
            const ordersRes = await fetch('http://localhost:3001/api/orders', {
                headers: { 'Authorization': `Bearer ${loginData.token}` }
            });
            const ordersData = await ordersRes.json();
            console.log('Orders Count:', ordersData.length);
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
};
test();
