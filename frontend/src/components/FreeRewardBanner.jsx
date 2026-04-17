// Free Reward Banner Component
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles } from 'lucide-react';
import { useFreeReward } from '../context/useFreeReward';
import { useCart } from '../context/CartContext';
import './FreeRewardBanner.css';

const FreeRewardBanner = () => {
  const { eligibility, freeItems, showRewardBanner, setShowRewardBanner, addFreeItemToCart } = useFreeReward();
  const { addToCart } = useCart();

  if (!showRewardBanner || !eligibility?.eligible) return null;

  const bannerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { y: -100, opacity: 0 }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="free-reward-banner"
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="reward-content">
          <div className="reward-icon">
            <Gift size={24} />
            <Sparkles size={16} className="sparkle" />
          </div>
          
          <div className="reward-text">
            <h3>🎉 You've Earned a FREE Item!</h3>
            <p>Choose any item under ₹150 - on us! 🎁</p>
          </div>
          
          <button 
            className="reward-close" 
            onClick={() => setShowRewardBanner(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {freeItems.length > 0 && (
          <div className="free-items-carousel">
            <div className="items-scroll">
              {freeItems.slice(0, 5).map((item) => (
                <div key={item.id || item._id} className="free-item-card">
                  <img 
                    src={item.image || '/images/placeholder-food.jpg'} 
                    alt={item.name}
                    className="item-image"
                  />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="item-restaurant">{item.restaurant}</p>
                    <div className="item-price">
                      <span className="original-price">₹{item.price}</span>
                      <span className="free-price">FREE!</span>
                    </div>
                    <button 
                      className="add-free-btn"
                      onClick={() => addFreeItemToCart(item, addToCart)}
                    >
                      Add Free
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FreeRewardBanner;
