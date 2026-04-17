const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/codebite';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('codebite');
    const users = db.collection('users');

    // Show all users before
    const all = await users.find({}, { projection: { email: 1, role: 1, name: 1 } }).toArray();
    console.log('All users before:');
    all.forEach(u => console.log(' -', u.email, '|', u.name, '| role:', u.role));

    // Promote rider@codebite.com (or any 'rider' email) to rider role
    const result = await users.updateMany(
      { email: { $regex: 'rider', $options: 'i' } },
      { $set: { role: 'rider' } }
    );
    console.log('\nUpdated', result.modifiedCount, 'user(s) to rider role.');

    // Show all users after
    const after = await users.find({}, { projection: { email: 1, role: 1, name: 1 } }).toArray();
    console.log('\nAll users after:');
    after.forEach(u => console.log(' -', u.email, '|', u.name, '| role:', u.role));
  } finally {
    await client.close();
  }
}

run().catch(console.error);
