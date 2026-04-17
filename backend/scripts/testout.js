import mongoose from 'mongoose';
import fs from 'fs';

async function test() {
  await mongoose.connect('mongodb://localhost:27017/codebite');
  const db = mongoose.connection;
  const restaurants = await db.collection('restaurants').find().toArray();
  const foods = await db.collection('foods').find().toArray();
  
  const text = '--- RESTAURANTS ---\n' + 
  restaurants.map(r => r.name).join('\n') + 
  '\n--- FOODS RESTAURANTS ---\n' + 
  [...new Set(foods.map(f => f.restaurant))].join('\n');
  fs.writeFileSync('out.txt', text);
  process.exit(0);
}

test();
