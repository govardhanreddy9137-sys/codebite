import mongoose from 'mongoose';
import 'dotenv/config';
import fs from 'fs';

let logContent = '';
function log(msg, obj = '') {
  const line = msg + (obj ? ' ' + JSON.stringify(obj, null, 2) : '') + '\n';
  console.log(msg, obj);
  logContent += line;
}

async function run() {
  try {
    log(`Using MONGO_URI: ${process.env.MONGO_URI}`);
    await mongoose.connect(process.env.MONGO_URI);
    log('Connected to MongoDB');

    const collections = ['users', 'orders', 'foods', 'restaurants'];
    for (const col of collections) {
      const collection = mongoose.connection.db.collection(col);
      const count = await collection.countDocuments();
      log(`Collection: ${col}, Count: ${count}`);
      if (count > 0) {
        const firstDoc = await collection.findOne();
        log(`First doc in ${col}:`, firstDoc);
      }
      const indexes = await collection.indexes();
      log(`Indexes for ${col}:`, indexes);
    }

    fs.writeFileSync('db_report.txt', logContent);
    process.exit(0);
  } catch (err) {
    log('Error:', err);
    fs.writeFileSync('db_report.txt', logContent);
    process.exit(1);
  }
}

run();
