import mongoose from 'mongoose';
import 'dotenv/config';
import fs from 'fs';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const restaurants = await mongoose.connection.db.collection('restaurants').find({}).toArray();
    const foods = await mongoose.connection.db.collection('foods').find({}).toArray();

    const report = {
      restaurants: restaurants.map(r => ({ name: r.name, image: r.image })),
      foods: foods.map(f => ({ name: f.name, restaurant: f.restaurantName || f.restaurant, image: f.image }))
    };

    fs.writeFileSync('image_report.json', JSON.stringify(report, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
