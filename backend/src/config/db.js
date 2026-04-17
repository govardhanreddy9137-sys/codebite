import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,   // Fail fast if Atlas is unreachable
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (error.message.includes('ENOTFOUND') || error.message.includes('timed out')) {
            console.error('💡 Hint: Check your MONGODB_URI in .env and ensure your IP is whitelisted in MongoDB Atlas Network Access.');
        }
        process.exit(1);
    }
};

export default connectDB;
