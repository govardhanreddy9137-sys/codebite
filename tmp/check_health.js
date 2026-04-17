import fetch from 'node-fetch';

async function checkHealth() {
  try {
    const res = await fetch('http://localhost:3001/api/health');
    const data = await res.json();
    console.log('Backend Health:', data);
  } catch (err) {
    console.error('Backend unreachable:', err.message);
  }
}

checkHealth();
