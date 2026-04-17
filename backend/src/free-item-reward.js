// Free Item Reward System - After certain purchases per day
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

// Configuration for free item rewards
const REWARD_CONFIG = {
  purchasesRequired: 5, // After 5 purchases in a day
  maxFreeItemPrice: 150, // Maximum price for free item
  freeItemCategory: 'Beverages', // Category of free items (optional)
  rewardMessage: "🎉 You've earned a FREE item! Select any item under ₹150"
};

// Check if user qualifies for free item
const checkFreeItemEligibility = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const Order = mongoose.model('Order');
    const todayOrders = await Order.find({
      userId,
      status: 'delivered',
      updatedAt: { $gte: today }
    });
    
    const eligibleOrders = todayOrders.filter(order => 
      order.total > 0 && order.status === 'delivered'
    );
    
    const purchaseCount = eligibleOrders.length;
    const isEligible = purchaseCount >= REWARD_CONFIG.purchasesRequired;
    
    return {
      eligible: isEligible,
      purchaseCount,
      required: REWARD_CONFIG.purchasesRequired,
      remaining: Math.max(0, REWARD_CONFIG.purchasesRequired - purchaseCount)
    };
  } catch (error) {
    log(`❌ Error checking eligibility: ${error.message}`, 'red');
    return { eligible: false, error: error.message };
  }
};

// Get available free items
const getAvailableFreeItems = async () => {
  try {
    const Food = mongoose.model('Food');
    const query = {
      isAvailable: true,
      price: { $lte: REWARD_CONFIG.maxFreeItemPrice }
    };
    
    if (REWARD_CONFIG.freeItemCategory) {
      query.category = REWARD_CONFIG.freeItemCategory;
    }
    
    const freeItems = await Food.find(query).limit(10);
    return freeItems;
  } catch (error) {
    log(`❌ Error getting free items: ${error.message}`, 'red');
    return [];
  }
};

// Test the reward system
const testRewardSystem = async () => {
  try {
    console.log('🎁 Testing Free Item Reward System...');
    log('🎁 Testing Free Item Reward System...', 'cyan');
    
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';
    await mongoose.connect(uri);
    log('✅ Connected to database', 'green');
    
    // Get available free items
    const freeItems = await getAvailableFreeItems();
    log(`\n🍱 Available Free Items (${freeItems.length}):`, 'yellow');
    
    if (freeItems.length === 0) {
      log('   No free items available with current criteria', 'gray');
    } else {
      freeItems.forEach((item, idx) => {
        log(`   ${idx + 1}. ${item.name} - ₹${item.price} @ ${item.restaurant}`, 'bright');
      });
    }
    
    // Test with a sample user (if orders exist)
    const Order = mongoose.model('Order');
    const sampleOrder = await Order.findOne({ status: 'delivered' });
    
    if (sampleOrder) {
      const eligibility = await checkFreeItemEligibility(sampleOrder.userId);
      log(`\n👤 Sample User Eligibility:`, 'magenta');
      log(`   User ID: ${sampleOrder.userId}`, 'bright');
      log(`   Today's Purchases: ${eligibility.purchaseCount}`, 'bright');
      log(`   Required: ${eligibility.required}`, 'bright');
      log(`   Remaining: ${eligibility.remaining}`, 'bright');
      log(`   Eligible: ${eligibility.eligible ? '✅ YES' : '❌ NO'}`, eligibility.eligible ? 'green' : 'red');
      
      if (eligibility.eligible) {
        log(`\n${REWARD_CONFIG.rewardMessage}`, 'green');
      }
    } else {
      log('\n⚠️ No delivered orders found to test eligibility', 'yellow');
    }
    
    log('\n✅ Reward system test complete!', 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  } finally {
    await mongoose.disconnect();
    log('🔌 Disconnected', 'gray');
  }
};

// Export functions for use in the application
export { checkFreeItemEligibility, getAvailableFreeItems, REWARD_CONFIG };

const rewardSystem = {
  checkFreeItemEligibility,
  getAvailableFreeItems,
  REWARD_CONFIG
};

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRewardSystem();
}

export default rewardSystem;
