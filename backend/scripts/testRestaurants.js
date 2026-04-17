import mongoose from 'mongoose';

async function test() {
  await mongoose.connect('mongodb://localhost:27017/codebite');
  const db = mongoose.connection;
  const foods = await db.collection('foods').find().toArray();
  const noRest = foods.filter(f => !f.restaurant);
  console.log('Foods with no restaurant:', noRest.length);
  process.exit(0);
}

test();
