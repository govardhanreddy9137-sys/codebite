import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api.js';

const PlaceOrderButton = ({ cartItems, address, total }) => {
  const navigate = useNavigate();

  const placeOrder = async () => {
    try {
      // Validate inputs
      if (!cartItems || cartItems.length === 0) {
        alert("Cart is empty");
        return;
      }
      
      if (!address) {
        alert("Please enter delivery address");
        return;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        address,
        total
      };

      // Send order to backend
      const res = await ordersAPI.create(orderData);

      if (res.success) {
        alert(res.message || "Order placed successfully");
        navigate("/orders");
      } else {
        alert(res.message || "Unable to place order");
      }

    } catch (error) {
      console.error("Order error:", error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <button 
      onClick={placeOrder}
      className="btn btn-primary"
      style={{ width: '100%', padding: '1rem' }}
    >
      Place Order
    </button>
  );
};

export default PlaceOrderButton;
