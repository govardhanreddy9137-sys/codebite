import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['employee', 'admin', 'merchant', 'rider'], default: 'employee' }
});

const User = mongoose.model('User', UserSchema);

async function syncUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = [
            { email: 'govardhan@gmail.com', password: 'govardhan@123', name: 'Admin Govardhan', role: 'admin' },
            { email: 'raider@gmail.com', password: 'password123', name: 'Rider 1', role: 'rider' },
            { email: 'raider1@gmail.com', password: 'password123', name: 'Rider 2', role: 'rider' },
            { email: 'rider@gmail.com', password: 'password123', name: 'Rider 1', role: 'rider' },
            { email: 'rider1@gmail.com', password: 'password123', name: 'Rider 2', role: 'rider' },
            { email: 'ammachettivanta@gmail.com', password: 'password123', name: 'Amma Chetti Vanta', role: 'merchant' },
            { email: 'kalpanahouse@gmail.com', password: 'password123', name: 'Kalpana House', role: 'merchant' },
            { email: 'homemadefood@gmail.com', password: 'password123', name: 'Home Made Food', role: 'merchant' },
            { email: 'andhrameals@gmail.com', password: 'password123', name: 'Andhra Meals', role: 'merchant' },
            { email: 'ammamagarriillu@gmail.com', password: 'password123', name: 'Amma Magarri Illu', role: 'merchant' },
            { email: 'tasteofpunjab@gmail.com', password: 'password123', name: 'Taste of Punjab', role: 'merchant' }
        ];

        for (const userData of users) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await User.findOneAndUpdate(
                { email: userData.email.trim().toLowerCase() },
                { 
                    $set: { 
                        password: hashedPassword,
                        name: userData.name,
                        role: userData.role
                    } 
                },
                { upsert: true, new: true }
            );
            console.log(`Synced user: ${userData.email}`);
        }

        console.log('All test accounts have been updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

syncUsers();
