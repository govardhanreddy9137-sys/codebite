import http from 'http';

const check = (url) => {
    return new Promise((resolve) => {
        http.get(encodeURI(url), (res) => {
            console.log(`URL: ${url} -> Status: ${res.statusCode}`);
            resolve();
        }).on('error', (err) => {
            console.error(`Error for ${url}:`, err.message);
            resolve();
        });
    });
};

async function run() {
    await check('http://localhost:3002/src/images/masala dosa.jpg');
    await check('http://localhost:3002/src/images/tomato pappu.jpg');
    await check('http://localhost:3002/src/images/Idli Sambar.webp');
}

run();
