import http from 'http';

const check = (url) => {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`URL: ${url}`);
                console.log(`Status: ${res.statusCode}`);
                if (res.statusCode === 200 && data.length > 0) {
                    try {
                        const json = JSON.parse(data);
                        console.log(`Items/Data length: ${Array.isArray(json) ? json.length : 'N/A'}`);
                        if (Array.isArray(json) && json.length > 0) {
                            console.log('Sample item:', json[0].name, 'Image:', json[0].image);
                        }
                    } catch {
                        console.log('Data is not JSON, might be an image');
                    }
                }
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Error for ${url}:`, err.message);
            resolve();
        });
    });
};

async function run() {
    console.log('--- Checking Foods ---');
    await check('http://localhost:3002/api/foods');
    console.log('\n--- Checking Restaurants ---');
    await check('http://localhost:3002/api/restaurants');
    console.log('\n--- Checking a Sample Image ---');
    await check('http://localhost:3002/src/images/idli.jpg');
}

run();
