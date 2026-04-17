// Enhanced Database Status Checker with detailed reporting
import mongoose from 'mongoose';
import 'dotenv/config';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (msg, color = 'reset') => console.log(`${COLORS[color]}${msg}${COLORS.reset}`);

const checkDatabaseStatus = async () => {
  const startTime = Date.now();
  
  try {
    log('🔍 Checking MongoDB connection status...', 'cyan');
    
    // Check environment variables
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      log('❌ MongoDB URI not found in environment variables', 'red');
      log('   Please set MONGODB_URI or MONGO_URI in your .env file', 'yellow');
      process.exit(1);
    }
    
    // Mask URI for security
    const maskedUri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@');
    log(`📡 Connecting to: ${maskedUri}`, 'blue');
    
    // Connect with timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    const connTime = Date.now() - startTime;
    log(`✅ MongoDB connection successful! (${connTime}ms)`, 'green');
    
    const db = mongoose.connection.db;
    const adminDb = db.admin();
    
    // Server info
    try {
      const serverInfo = await adminDb.serverInfo();
      log(`\n📊 Server Version: ${serverInfo.version}`, 'cyan');
    } catch (e) {
      // Continue if we can't get server info
    }
    
    // Database stats
    const stats = await db.stats();
    log(`💾 Database: ${db.databaseName}`, 'cyan');
    log(`   Collections: ${stats.collections}`, 'bright');
    log(`   Documents: ${stats.objects.toLocaleString()}`, 'bright');
    log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`, 'bright');
    
    // Collections detail
    const collections = await db.listCollections().toArray();
    log('\n� Collections:', 'magenta');
    
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      const indexes = await coll.indexes();
      
      log(`  ├─ ${collection.name}: ${count.toLocaleString()} docs (${indexes.length} indexes)`, 'bright');
    }
    
    // Users check
    try {
      const users = await db.collection('users').find({}, { projection: { email: 1, role: 1 } }).limit(5).toArray();
      if (users.length > 0) {
        log('\n👤 Sample Users:', 'yellow');
        users.forEach(u => log(`  ├─ ${u.email} (${u.role || 'user'})`, 'bright'));
      }
    } catch (e) {
      // Collection might not exist
    }
    
    // Foods check
    try {
      const foods = await db.collection('foods').find({}, { projection: { name: 1, restaurant: 1, price: 1 } }).limit(5).toArray();
      if (foods.length > 0) {
        log('\n🍱 Sample Foods:', 'yellow');
        foods.forEach(f => log(`  ├─ ${f.name} @ ${f.restaurant} - ₹${f.price}`, 'bright'));
      }
    } catch (e) {
      // Collection might not exist
    }
    
    // Orders check
    try {
      const orders = await db.collection('orders').find().sort({ createdAt: -1 }).limit(5).toArray();
      if (orders.length > 0) {
        log('\n📦 Recent Orders:', 'yellow');
        orders.forEach(o => {
          const orderId = o._id.toString().slice(-6);
          const status = o.status || 'unknown';
          const total = o.total || 0;
          log(`  ├─ Order #${orderId}: ₹${total} (${status})`, 'bright');
        });
      } else {
        log('\n📦 No orders found', 'yellow');
      }
    } catch (e) {
      // Collection might not exist
    }
    
    // Health check
    log('\n💚 Health Check:', 'green');
    log('  ✓ Connection: OK', 'green');
    log('  ✓ Read Operations: OK', 'green');
    log('  ✓ Collections: OK', 'green');
    
    const totalTime = Date.now() - startTime;
    log(`\n🎉 Database is fully operational! (Total: ${totalTime}ms)`, 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    
    if (error.name === 'MongooseServerSelectionError') {
      log('\n💡 Tips:', 'yellow');
      log('  • Check if MongoDB is running', 'bright');
      log('  • Verify your connection string', 'bright');
      log('  • Check network connectivity', 'bright');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log('\n🔌 Disconnected from MongoDB', 'blue');
  }
};

checkDatabaseStatus();
