// Free Item Reward Hook for Frontend
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const REWARD_CONFIG = {
  purchasesRequired: 5, // After 5 purchases in a day
  maxFreeItemPrice: 150, // Maximum price for free item
  rewardMessage: "🎉 You've earned a FREE item! Select any item under ₹150"
};

export const useFreeReward = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [eligibility, setEligibility] = useState(null);
  const [freeItems, setFreeItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRewardBanner, setShowRewardBanner] = useState(false);

  // Check eligibility
  const checkEligibility = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/rewards/eligibility/${user.id}`);
      const data = await response.json();
      
      if (data.ok) {
        setEligibility(data.eligibility);
        
        // Show banner if eligible
        if (data.eligibility.eligible) {
          setShowRewardBanner(true);
          showToast(REWARD_CONFIG.rewardMessage, 'success');
        }
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get available free items
  const fetchFreeItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rewards/free-items');
      const data = await response.json();
      
      if (data.ok) {
        setFreeItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching free items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check on mount and when user changes
  useEffect(() => {
    if (user) {
      checkEligibility();
      fetchFreeItems();
    }
  }, [user]);

  // Add free item to cart
  const addFreeItemToCart = (item, addToCart) => {
    const freeItem = { ...item, price: 0, isFreeReward: true };
    addToCart(freeItem);
    showToast(`🎁 ${item.name} added to cart for FREE!`, 'success');
    setShowRewardBanner(false);
  };

  return {
    eligibility,
    freeItems,
    loading,
    showRewardBanner,
    setShowRewardBanner,
    checkEligibility,
    fetchFreeItems,
    addFreeItemToCart,
    REWARD_CONFIG
  };
};
