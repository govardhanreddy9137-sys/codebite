import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api.js';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(() => {
        const saved = localStorage.getItem('codebite.current_order');
        return saved ? JSON.parse(saved) : null;
    });

    // Persist currentOrder
    useEffect(() => {
        if (currentOrder) {
            localStorage.setItem('codebite.current_order', JSON.stringify(currentOrder));
        } else {
            localStorage.removeItem('codebite.current_order');
        }
    }, [currentOrder]);

    useEffect(() => {
        if (!user) {
            setOrders([]);
            setLoading(false);
            return;
        }
        const loadOrders = async () => {
            try {
                const res = await ordersAPI.get();
                setOrders(res);
            } catch (err) {
                console.error('Failed to load orders:', err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [user]);

    const ordersByUser = useMemo(() => {
        const map = new Map();
        if (Array.isArray(orders)) {
            orders.forEach(o => {
                if (o && o.userId) {
                    if (!map.has(o.userId)) map.set(o.userId, []);
                    map.get(o.userId).push(o);
                }
            });
        }
        return map;
    }, [orders]);

    const addToCart = (food) => {
        const foodId = food._id || food.id;
        const existingItem = cart.find(item => (item._id || item.id) === foodId);
        
        if (existingItem) {
            setCart(cart.map(item => (item._id || item.id) === foodId ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...food, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            const itemId = item._id || item.id;
            if (itemId === id) {
                const newQty = item.quantity + delta;
                return newQty >= 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id) => {
        const itemToRemove = cart.find(item => (item._id || item.id) === id);
        setCart(cart.filter(item => (item._id || item.id) !== id));
        if (itemToRemove) {
            showToast(`${itemToRemove.name} removed from cart.`, 'info');
        }
    };

    const clearCart = () => {
        setCart([]);
    };


    const placeOrder = async (userId, options = {}) => {
        if (cart.length === 0) return { ok: false, error: 'Cart is empty.' };

        const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const penaltyAmount = user?.penalty || 0;
        const totalWithPenalty = (options.total || itemsTotal) + penaltyAmount;

        const newOrder = {
            userId: userId || user?.id || user?._id,
            items: cart.map(item => ({
                id: (item.id || item._id || '').toString(),
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                restaurant: item.restaurant || 'Unknown Restaurant'
            })),
            total: totalWithPenalty,
            tax: options.tax || 0,
            deliveryCharge: options.deliveryCharge || 0,
            discount: options.discount || 0,
            penaltyApplied: penaltyAmount,
            status: 'pending',
            deliveryAddress: options.deliveryAddress || '',
            deliveryRoom: options.deliveryRoom || '',
            groupCode: options.groupCode || '',
            customerPhone: options.customerPhone?.trim() || user?.phone?.trim() || '9023865544', // Fallback to merchant phone if all else fails
            isGift: options.isGift || false,
            giftRecipient: options.giftRecipient || '',
            restaurant: cart[0]?.restaurant || 'Multiple',
            restaurantAddress: cart[0]?.restaurantAddress || 'Main Kitchen, Zone A'
        };

        console.log('=== ORDER CREATION DEBUG START ===');
        console.log('Cart items:', cart);
        console.log('Items total:', itemsTotal);
        console.log('Calculated/Passed total:', options.total || itemsTotal);
        console.log('User ID:', userId || user?.id || user?._id);
        console.log('New order data:', JSON.stringify(newOrder, null, 2));
        console.log('=== ORDER CREATION DEBUG END ===');

        try {
            console.log('Sending order creation request to API...');
            const res = await ordersAPI.create(newOrder);
            console.log('Order creation response:', res);
            const savedOrder = res.order || res;
            
            // Immediately update local orders list to ensure it's visible even without refresh
            setOrders(prev => [savedOrder, ...prev]);
            
            if (penaltyAmount > 0) {
                await updateUser({ penalty: 0 });
                showToast(`Previous penalty of ₹${penaltyAmount} has been paid!`, 'success');
            }
            
            clearCart();
            setCurrentOrder(savedOrder);
            showToast('Booking Created! Opening Secure Payment...', 'info');
            setShowPayment(true);
            return { ok: true, order: savedOrder };
        } catch (err) {
            console.error('Order creation error:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unable to place order';
            console.error('Error message:', errorMsg);
            alert(`Order Creation Error: ${errorMsg}\n\nPlease check browser console (F12) for detailed debug logs.`);
            return { ok: false, error: errorMsg };
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await ordersAPI.updateStatus(orderId, status);
            setOrders(prev => Array.isArray(prev) ? prev.map(o => (o._id || o.id) === orderId ? { ...o, status } : o) : []);
        } catch {
            // fallback: optimistic update
            setOrders(prev => Array.isArray(prev) ? prev.map(o => (o._id || o.id) === orderId ? { ...o, status } : o) : []);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            await ordersAPI.delete(orderId);
            setOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
        } catch {
            // fallback
            setOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
        }
    };

    const handlePaymentSuccess = async (paymentResult) => {
        const orderToTrack = paymentResult?.order || currentOrder;
        
        if (orderToTrack) {
            const orderId = orderToTrack._id || orderToTrack.id;
            
            // Check if there's a pass in the order
            const passItem = orderToTrack.items?.find(item => item.id && item.id.startsWith('pass_'));
            
            if (passItem) {
                // Large sounds alarm for subscription
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); // Loud success sound
                    audio.volume = 0.8;
                    audio.play();
                } catch (e) {
                    console.error('Failed to play alarm sound:', e);
                }

                showToast(`🎉 Subscription Success! ${passItem.name} activated!`, 'success');
                
                // Update user subscription in database
                const durationDays = passItem.id.includes('basic') ? 7 : passItem.id.includes('premium') ? 30 : 90;
                const subscription = {
                    planId: passItem.id.replace('pass_', ''),
                    name: passItem.name,
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
                    durationDays: durationDays,
                    status: 'active'
                };
                
                try {
                    await updateUser({ subscription });
                } catch (err) {
                    console.error('Failed to update subscription:', err);
                }
            } else {
                showToast('Order confirmed! Enjoy your meal 🍱', 'success');
            }
            
            try {
                await updateOrderStatus(orderId, 'confirmed');
            } catch (err) { }
            
            setCurrentOrder(null);
            setShowPayment(false);
            
            setTimeout(() => {
                navigate(`/order-success/${orderId}`);
            }, 100);
        } else {
            showToast('Order confirmed!', 'success');
            setShowPayment(false);
            navigate('/orders');
        }
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
        setCurrentOrder(null);
    };

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart,
            orders, placeOrder, updateOrderStatus, deleteOrder, loading,
            showPayment, currentOrder, handlePaymentSuccess, handlePaymentCancel
        }}>
            {children}
        </CartContext.Provider>
    );
};
