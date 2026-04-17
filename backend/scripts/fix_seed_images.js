const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'src', 'seed.js');
let content = fs.readFileSync(seedPath, 'utf8');

const imagesFallback = [
    'src/images/veg meals.avif',
    'src/images/chicken biryani.webp',
    'src/images/masala dosa.jpg',
    'src/images/Butter Chicken.webp',
    'src/images/Aloo Paratha.webp',
    'src/images/Idli Sambar.webp',
    'src/images/Mutton Biryani.webp',
    'src/images/Filter Coffee.webp'
];

let counter = 0;
// Replace all unsplash links with cycling local images
content = content.replace(/https:\/\/images\.unsplash\.com\/[^']+/g, (match) => {
    const replacement = imagesFallback[counter % imagesFallback.length];
    counter++;
    return replacement;
});

fs.writeFileSync(seedPath, content, 'utf8');
console.log('Successfully updated seed.js with local images');
