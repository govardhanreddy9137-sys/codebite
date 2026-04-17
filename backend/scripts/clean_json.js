import fs from 'fs';

const allowedRestaurants = [
    'Amma Chetti Vanta',
    'Andhra Meals',
    'Kalpana House',
    'Home Made Food',
    'Ammama Garri Illu',
    'Hotel Taj Palace',
    'Taste of Punjab'
];

// Clean foods_utf8.json
const foodsPath = '../foods_utf8.json';
if (fs.existsSync(foodsPath)) {
    let raw = fs.readFileSync(foodsPath, 'utf8').replace(/^\uFEFF/, '');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : (data.value || []);
    const filtered = arr.filter(f => allowedRestaurants.includes(f.restaurant));
    const toWrite = Array.isArray(data) ? filtered : { value: filtered };
    fs.writeFileSync(foodsPath, JSON.stringify(toWrite, null, 4), 'utf8');
    console.log(`Cleaned foods_utf8.json, now has ${filtered.length} items`);
}

// Clean restaurants_utf8.json
const restsPath = '../restaurants_utf8.json';
if (fs.existsSync(restsPath)) {
    let raw = fs.readFileSync(restsPath, 'utf8').replace(/^\uFEFF/, '');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data) ? data : (data.value || []);
    const filtered = arr.filter(r => allowedRestaurants.includes(r.name));
    const toWrite = Array.isArray(data) ? filtered : { value: filtered };
    fs.writeFileSync(restsPath, JSON.stringify(toWrite, null, 4), 'utf8');
    console.log(`Cleaned restaurants_utf8.json, now has ${filtered.length} restaurants`);
}
