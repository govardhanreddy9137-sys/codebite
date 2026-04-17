// Enhanced Order Status Checker with detailed reporting and filtering
import mongoose from 'mongoose';
import '../src/models/Order.js';
import 'dotenv/config';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

const log = (msg, color = 'reset') => console.log(`${COLORS[color]}${msg}${COLORS.reset}`);

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatCurrency = (amount) => {
  return `₹${amount?.toLocaleString('en-IN') || 0}`;
};

const checkOrders = async () => {
  const startTime = Date.now();
  
  try {
    log('🔍 Checking Orders Database...', 'cyan');
    
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';
    await mongoose.connect(uri);
    
    const connTime = Date.now() - startTime;
    log(`✅ Connected (${connTime}ms)\n`, 'green');
    
    const Order = mongoose.model('Order');
    
    // Get all order stats
    const totalOrders = await Order.countDocuments();
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Build status map
    const statusMap = {};
    statusCounts.forEach(s => statusMap[s._id || 'unknown'] = s.count);
    
    log('📊 Order Statistics:', 'magenta');
    log(`   Total Orders: ${totalOrders}`, 'bright');
    
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];
    statuses.forEach(status => {
      const count = statusMap[status] || 0;
      const color = status === 'pending' ? 'yellow' : 
                    status === 'delivered' ? 'green' : 
                    status === 'cancelled' ? 'red' : 'cyan';
      log(`   ${status.padEnd(12)}: ${count.toString().padStart(3)}`, color);
    });
    
    // Active orders (pending, preparing, ready)
    const activeStatuses = ['pending', 'preparing', 'ready'];
    const activeOrders = await Order.find({ 
      status: { $in: activeStatuses } 
    }).sort({ createdAt: -1 });
    
    log(`\n🚀 Active Orders (${activeOrders.length}):`, 'yellow');
    
    if (activeOrders.length === 0) {
      log('   No active orders at the moment', 'gray');
    } else {
      activeOrders.forEach((order, idx) => {
        const orderId = order._id.toString().slice(-6);
        const status = order.status || 'unknown';
        const total = formatCurrency(order.total);
        const items = order.items?.length || 0;
        const time = formatDate(order.createdAt);
        
        const statusColor = status === 'pending' ? 'yellow' : 
                           status === 'preparing' ? 'cyan' : 
                           status === 'ready' ? 'green' : 'bright';
        
        log(`\n   ${idx + 1}. Order #${orderId}`, 'bright');
        log(`      Status: ${status.toUpperCase()}`, statusColor);
        log(`      Total: ${total}`, 'bright');
        log(`      Items: ${items}`, 'bright');
        log(`      Created: ${time}`, 'gray');
        
        // Show first 2 items
        if (order.items && order.items.length > 0) {
          log(`      Products:`, 'gray');
          order.items.slice(0, 2).forEach(item => {
            log(`        • ${item.name} x${item.quantity || 1}`, 'gray');
          });
          if (order.items.length > 2) {
            log(`        ... and ${order.items.length - 2} more`, 'gray');
          }
        }
      });
    }
    
    // Recent completed orders
    const recentCompleted = await Order.find({ 
      status: { $in: ['delivered', 'cancelled'] } 
    }).sort({ updatedAt: -1 }).limit(3);
    
    log(`\n📦 Recent Completed Orders (${recentCompleted.length}):`, 'blue');
    
    if (recentCompleted.length === 0) {
      log('   No completed orders yet', 'gray');
    } else {
      recentCompleted.forEach(order => {
        const orderId = order._id.toString().slice(-6);
        const status = order.status || 'unknown';
        const total = formatCurrency(order.total);
        const time = formatDate(order.updatedAt);
        const statusIcon = status === 'delivered' ? '✅' : '❌';
        
        log(`   ${statusIcon} Order #${orderId}: ${total} (${status}) - ${time}`, 
            status === 'delivered' ? 'green' : 'red');
      });
    }
    
    // Revenue stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.find({ 
      status: 'delivered',
      updatedAt: { $gte: today }
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthOrders = await Order.find({ 
      status: 'delivered',
      updatedAt: { $gte: monthStart }
    });
    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    
    log(`\n💰 Revenue Summary:`, 'green');
    log(`   Today's Revenue: ${formatCurrency(todayRevenue)} (${todayOrders.length} orders)`, 'bright');
    log(`   This Month: ${formatCurrency(monthRevenue)} (${monthOrders.length} orders)`, 'bright');
    
    const totalTime = Date.now() - startTime;
    log(`\n🎉 Done! (Total: ${totalTime}ms)\n`, 'green');
    
  } catch (err) {
    log(`\n❌ Error: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log('🔌 Disconnected', 'gray');
  }
};

checkOrders();
