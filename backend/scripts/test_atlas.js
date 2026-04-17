import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
console.log('Testing URI:', uri);

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Successfully connected to Atlas!");
    await client.close();
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    process.exit();
  }
}
run();
