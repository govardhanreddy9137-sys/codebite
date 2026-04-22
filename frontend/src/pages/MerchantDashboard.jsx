import React, { useState, useEffect, useRef } from 'react';
import { Store, TrendingUp, Users, LogOut, Bell, BellOff, CheckCircle, Clock, Activity, Zap, MapPin, ChefHat, Zap as Bolt, XCircle, AlertCircle, Plus, Edit, Trash2, Flame, Trophy, Target, Star, Briefcase, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, foodsAPI } from '../api.js';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import './MerchantDashboard.css';

const MerchantDashboard = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [allOrdersData, setAllOrdersData] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isAlarming, setIsAlarming] = useState(false);
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [showDeliveryHistory, setShowDeliveryHistory] = useState(false);
    const [foodForm, setFoodForm] = useState({
        name: '', price: '', category: 'veg', description: '', image: '', stock: 50
    });
    
    const lastOrderCount = useRef(0);
    const audioContextRef = useRef(null);
    const alarmIntervalRef = useRef(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current) audioContextRef.current.close();
            if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
        };
    }, []);

    const playBellAlarm = () => {
        if (!soundEnabled || isAlarming) return;
        setIsAlarming(true);
        
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'); // Large siren alarm
        audio.loop = true;
        audio.volume = 1.0;
        
        const startAlarm = () => {
            audio.play().catch(e => console.error('Sound play failed:', e));
        };

        startAlarm();
        alarmIntervalRef.current = audio;
    };

    const stopAlarm = () => {
        setIsAlarming(false);
        if (alarmIntervalRef.current) {
            alarmIntervalRef.current.pause();
            alarmIntervalRef.current = null;
        }
    };

    const fetchData = async () => {
        try {
            const allOrders = await ordersAPI.get();
            const restaurantOrders = allOrders.filter(o => {
                return user?.restaurantName ? o.items?.some(it => it.restaurant === user.restaurantName) : true;
            });
            
            const liveOrders = restaurantOrders.filter(o => {
                return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status);
            });
            
            const pendingOrders = liveOrders.filter(o => o.status === 'pending');
            if (pendingOrders.length > lastOrderCount.current && lastOrderCount.current > 0) {
                playBellAlarm();
                showToast('🚨 NEW ORDER RECEIVED!', 'warning');
            }
            lastOrderCount.current = pendingOrders.length;
            setOrders(liveOrders);
            setAllOrdersData(restaurantOrders);

            const allFoods = await foodsAPI.get();
            const restaurantFoods = user?.restaurantName ? allFoods.filter(f => f.restaurant === user.restaurantName) : allFoods;
            setFoods(restaurantFoods);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Get customer data from orders
    const customerData = (() => {
        const customers = {};
        if (Array.isArray(allOrdersData)) {
            allOrdersData.forEach(o => {
                if (o.customerPhone || o.customerName || o.user) {
                    const key = o.customerPhone || o.user?.phone || 'unknown';
                    if (!customers[key]) {
                        customers[key] = {
                            phone: key,
                            name: o.customerName || o.user?.name || 'Unknown',
                            address: o.deliveryAddress || o.address || 'Unknown',
                            orders: 0,
                            totalSpent: 0
                        };
                    }
                    customers[key].orders += 1;
                    customers[key].totalSpent += o.total || o.amount || 0;
                }
            });
        }
        return Object.values(customers).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
    })();

    // Calculate completed orders for delivery history
    const completedOrdersList = Array.isArray(allOrdersData) ? allOrdersData.filter(o => o?.status === 'delivered') : [];

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Changed from 5000 to 30000 (30 seconds)
        return () => clearInterval(interval);
    }, [user?.restaurantName]);

    const handleAcceptOrder = async (orderId) => {
        try {
            stopAlarm();
            console.log('Accepting order:', orderId);
            console.log('User role:', user?.role);
            console.log('User email:', user?.email);
            const response = await ordersAPI.updateStatus(orderId, 'preparing');
            console.log('Accept order response:', response);
            showToast('Order Accepted! Start cooking.', 'success');
            fetchData();
        } catch (err) {
            console.error('Failed to accept order:', err);
            console.error('Error details:', {
                message: err.message,
                status: err.status,
                orderId,
                userRole: user?.role
            });
            if (err.message?.includes('Unauthorized') || err.message?.includes('Forbidden')) {
                showToast('Permission denied: Merchant role cannot update order status. Backend authorization issue.', 'error');
            } else {
                showToast('Failed to accept order: ' + (err.message || 'Unknown error'), 'error');
            }
        }
    };

    const handleFoodSubmit = async (e) => {
        e.preventDefault();
        try {
            const foodData = { ...foodForm, restaurant: user?.restaurantName || 'Codebite' };
            if (editingFood) {
                await foodsAPI.update(editingFood._id || editingFood.id, foodData);
                showToast('Item updated successfully', 'success');
            } else {
                await foodsAPI.create(foodData);
                showToast('New item added', 'success');
            }
            setShowFoodModal(false);
            setEditingFood(null);
            setFoodForm({ name: '', price: '', category: 'veg', description: '', image: '', stock: 50 });
            fetchData();
        } catch (err) {
            showToast('Failed to save food item', 'error');
        }
    };

    const handleEditFood = (food) => {
        setEditingFood(food);
        setFoodForm({
            name: food.name,
            price: food.price,
            category: food.category || 'veg',
            description: food.description || '',
            image: food.image || '',
            stock: food.stock || 0
        });
        setShowFoodModal(true);
    };

    const handleDeleteFood = async (foodId) => {
        if (window.confirm('Delete this menu item?')) {
            try {
                await foodsAPI.delete(foodId);
                showToast('Item deleted', 'success');
                fetchData();
            } catch (err) {
                showToast('Failed to delete item', 'error');
            }
        }
    };

    if (loading) return <div className="container text-center" style={{ padding: '4rem' }}><h2>Connecting to Kitchen...</h2></div>;

    return (
        <motion.div 
            className="merchant-portal-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {isAlarming && (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="alert-banner"
                    style={{ 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                        color: '#fff', 
                        padding: '1rem', 
                        textAlign: 'center', 
                        fontWeight: 'bold',
                        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        borderRadius: '16px',
                        margin: '1rem 0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <AlertCircle size={24} />
                        </motion.div>
                        <span style={{ fontSize: '1.1rem' }}>🚨 NEW ORDER! DISMISS OR ACCEPT TO STOP BELL! 🚨</span>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <AlertCircle size={24} />
                        </motion.div>
                    </div>
                    <button onClick={stopAlarm} className="btn" style={{ marginLeft: '1rem', background: '#000', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '8px' }}>Dismiss</button>
                </motion.div>
            )}

            <motion.div 
                className="merchant-header glass-premium"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    margin: '1rem 0 2rem',
                    padding: '2rem',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="logo-pulse" style={{ 
                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                        padding: '1rem',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                    }}>
                        <ChefHat size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.restaurantName || 'Codebite Restaurant'}</h1>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>MAIN_KITCHEN_OPERATIONS</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSoundEnabled(!soundEnabled)} 
                        className="btn btn-outline" 
                        style={{ 
                            borderRadius: '12px',
                            padding: '0.75rem 1rem',
                            border: soundEnabled ? '2px solid #10b981' : '2px solid #6b7280'
                        }}
                    >
                        {soundEnabled ? <Bell size={18} color="#10b981" /> : <BellOff size={18} color="#6b7280" />}
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowDeliveryHistory(!showDeliveryHistory)} 
                        className="btn btn-outline" 
                        style={{ 
                            borderRadius: '12px',
                            padding: '0.75rem 1rem',
                            border: showDeliveryHistory ? '2px solid #8b5cf6' : '2px solid #3b82f6'
                        }}
                    >
                        {showDeliveryHistory ? 'Hide History' : 'Show History'}
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={logout} 
                        className="btn btn-outline" 
                        style={{ 
                            color: '#ef4444',
                            borderRadius: '12px',
                            padding: '0.75rem 1rem',
                            border: '2px solid #ef4444'
                        }}
                    >
                        <LogOut size={18} />
                    </motion.button>
                </div>
            </motion.div>

            {/* Delivery History */}
            {showDeliveryHistory && (
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass-premium"
                    style={{ 
                        padding: '2rem', 
                        borderRadius: '24px', 
                        marginBottom: '2rem',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <CheckCircle size={28} color="#10b981" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Delivery History</h2>
                    </div>
                    {completedOrdersList.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            No completed deliveries yet
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {completedOrdersList.map(order => (
                                <div key={order._id || order.id} style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>
                                            Order #{(order._id || order.id || '').toString().slice(-6).toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {(order.items && order.items[0]?.restaurant) || order.restaurant || order.restaurantName || 'Restaurant'} → {order.deliveryAddress || order.address}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            ₹{order.total?.toFixed(2)} • {new Date(order.deliveredAt || order.updatedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                        color: '#10b981',
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                    }}>
                                        Delivered
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

                    <div className="stats-grid">
                        {[
                            { label: 'Active Queue', value: orders.length, color: '#ef4444', icon: <Flame size={24}/>, desc: orders.length > 0 ? 'Orders Pending' : 'Kitchen Clear' },
                            { label: 'Revenue Today', value: `₹${allOrdersData.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0)}`, color: '#10b981', icon: <Trophy size={24}/>, desc: 'Total Sales' },
                            { label: 'Menu Items', value: foods.length, color: '#3b82f6', icon: <Store size={24}/>, desc: 'Available Items' },
                            { label: 'Delivered', value: completedOrdersList.length, color: '#8b5cf6', icon: <Target size={24}/>, desc: 'Completed Today' }
                        ].map((stat, idx) => (
                            <motion.div 
                                key={idx}
                                className="card stat-card-premium"
                                whileHover={{ scale: 1.05, y: -5 }}
                                style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                            >
                                <div style={{ color: stat.color, opacity: 0.2, position: 'absolute', top: '1rem', right: '1rem' }}>{stat.icon}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{stat.label}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: stat.color, marginTop: '0.5rem' }}>{stat.desc}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                        <div className="orders-section">
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Clock size={24} color="#f59e0b" /> Live kitchen Queue
                            </h2>
                            {orders.length === 0 ? (
                                <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <ChefHat size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p>Waiting for new orders... Enjoy the silence!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {orders.map(order => (
                                        <motion.div 
                                            key={order._id || order.id} 
                                            className="card order-item-premium"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>#{ (order._id || order.id || '').toString().slice(-6).toUpperCase() }</h3>
                                                        <span className="status-indicator" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                                            {order.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                                                        {order.customerName || 'Anonymous Customer'}
                                                    </p>
                                                    
                                                    <div className="user-address-badge">
                                                        <MapPin size={16} />
                                                        <span>Deliver To: {order.deliveryAddress || order.address}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, fontSize: '1.5rem', color: '#f59e0b' }}>₹{order.total}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{order.items?.length || 0} Items</div>
                                                </div>
                                            </div>

                                            <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 600 }}>{item.name} <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>x{item.quantity}</span></span>
                                                        <span style={{ color: 'var(--text-secondary)' }}>₹{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                                {order.status === 'pending' ? (
                                                    <button onClick={() => handleAcceptOrder(order._id || order.id)} className="btn btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <CheckCircle size={20} /> START PREPARING
                                                    </button>
                                                ) : order.status === 'preparing' || order.status === 'confirmed' ? (
                                                    <button onClick={() => ordersAPI.updateStatus(order._id || order.id, 'ready').then(fetchData)} className="btn btn-success" style={{ flex: 1, padding: '1rem', borderRadius: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <Zap size={20} /> READY FOR PICKUP
                                                    </button>
                                                ) : (
                                                    <button disabled className="btn btn-secondary" style={{ flex: 1, padding: '1rem', borderRadius: '14px', fontWeight: 700, opacity: 0.5 }}>
                                                        ORDER {order.status.replace(/_/g, ' ').toUpperCase()}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="crm-section">
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Users size={24} color="#10b981" /> Top Customers
                            </h2>
                            {customerData.length === 0 ? (
                                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <Users size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p>Building your customer base...</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {customerData.map((customer, i) => (
                                        <motion.div 
                                            key={i} 
                                            className="card" 
                                            style={{ padding: '1.25rem' }}
                                            whileHover={{ x: 5 }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>{customer.name}</div>
                                                <div style={{ fontWeight: 800, color: '#10b981' }}>₹{customer.totalSpent}</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    <Phone size={14} color="#f59e0b" />
                                                    {customer.phone}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    <MapPin size={14} color="#ef4444" />
                                                    {customer.address}
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                                                {customer.orders} Successful Orders
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


            {/* Food Management Modal */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Menu Management</h2>
                    <button onClick={() => { setEditingFood(null); setFoodForm({ name: '', price: '', category: 'veg', description: '', image: '', stock: 50 }); setShowFoodModal(true); }} className="btn btn-primary btn-sm">
                        <Plus size={16} /> Add Item
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {foods.map(food => (
                        <div key={food._id || food.id} className="card" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <img src={food.image || '/images/default-food.png'} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} alt={food.name} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{food.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>₹{food.price} • Stock: {food.stock}</div>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditFood(food)} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem' }}><Edit size={14} /></button>
                                        <button onClick={() => handleDeleteFood(food._id || food.id)} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', color: '#ef4444' }}><Trash2 size={14} /></button>
                                        <button 
                                            onClick={() => foodsAPI.update(food._id || food.id, { ...food, isAvailable: !food.isAvailable }).then(fetchData)} 
                                            className={`btn btn-sm ${food.isAvailable ? 'btn-success' : 'btn-danger'}`}
                                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', fontWeight: 'bold' }}
                                        >
                                            {food.isAvailable ? 'In Stock' : 'OUT OF STOCK'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showFoodModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>{editingFood ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                        <form onSubmit={handleFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Item Name</label>
                                <input type="text" value={foodForm.name} onChange={e => setFoodForm({...foodForm, name: e.target.value})} className="form-input" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Price</label>
                                    <input type="number" value={foodForm.price} onChange={e => setFoodForm({...foodForm, price: e.target.value})} className="form-input" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Category</label>
                                    <select value={foodForm.category} onChange={e => setFoodForm({...foodForm, category: e.target.value})} className="form-input">
                                        <option value="veg">Veg</option>
                                        <option value="nonveg">Non-Veg</option>
                                        <option value="tiffins">Tiffins</option>
                                        <option value="drinks">Drinks</option>
                                        <option value="shakes">Shakes</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Image URL</label>
                                <input type="text" value={foodForm.image} onChange={e => setFoodForm({...foodForm, image: e.target.value})} className="form-input" placeholder="https://..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Description</label>
                                <textarea value={foodForm.description} onChange={e => setFoodForm({...foodForm, description: e.target.value})} className="form-input" rows="3"></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowFoodModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MerchantDashboard;
