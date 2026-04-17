import { ordersAPI } from '../api.js';

export const placeOrder = async (orderData) => {
  try {
    const res = await ordersAPI.create(orderData);
    
    if (res.ok) {
      // Success: show success message and navigate to order history
      alert('Order placed successfully!');
      window.location.href = '/order-history';
      return { success: true, order: res };
    } else {
      // Backend returned error
      const errorMsg = res.error || 'Unable to place order';
      alert(`Order failed: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    // Network or server error
    console.error('Order placement error:', err);
    const errorMsg = err.response?.data?.error || err.message || 'Unable to place order';
    alert(`Order failed: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
};
