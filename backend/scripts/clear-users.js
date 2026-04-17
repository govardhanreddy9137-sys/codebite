import mongoose from 'mongoose';
import User from '../src/models/User.js';

await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
await User.deleteMany({ email: { $in: ['harsha@gmail.com', 'vvv@gmail.com', 'nnn@gmail.com', 'phani@gmail.com'] } });
console.log('Cleared problematic users');
await mongoose.disconnect();
