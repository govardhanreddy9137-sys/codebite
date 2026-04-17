import mongoose from 'mongoose';
import 'dotenv/config';

// Local URI (From your Compass)
const LOCAL_URI = 'mongodb://localhost:27017/codebite';

// Atlas URI (Newly created)
const ATLAS_URI = process.env.MONGODB_URI;

const migrate = async () => {
    try {
        console.log('🔄 Starting migration from Local to Atlas...');

        // 1. Connect to Local
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Connected to Local MongoDB');

        // 2. Connect to Atlas
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log('✅ Connected to MongoDB Atlas');

        // 3. Get collections from Local
        const collections = await localConn.db.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections locally.`);

        for (const col of collections) {
            const name = col.name;
            if (name.startsWith('system.')) continue;

            console.log(`📤 Migrating collection: ${name}...`);

            // Fetch data from local
            const data = await localConn.db.collection(name).find({}).toArray();
            console.log(`   - Found ${data.length} documents.`);

            if (data.length > 0) {
                // Clear existing data in Atlas for this collection to avoid duplicates
                await atlasConn.db.collection(name).deleteMany({});
                
                // Insert into Atlas
                await atlasConn.db.collection(name).insertMany(data);
                console.log(`   - Successfully inserted into Atlas.`);
            } else {
                console.log(`   - Skipping empty collection.`);
            }
        }

        console.log('\n✨ MIGRATION COMPLETE! Your Atlas database is now synced with your local data.');
        
        await localConn.close();
        await atlasConn.close();
        process.exit(0);

    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrate();
