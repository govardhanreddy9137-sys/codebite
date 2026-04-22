import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Phone, Package, Bell, BellOff, LogOut, Route, Zap, Store, CheckCircle } from 'lucide-react';
import { ridersAPI, ordersAPI } from '../api.js';
import { useToast } from '../context/ToastContext';
import './RaiderDashboard.css';

const RaiderDashboard = () => {
    const { logout } = useAuth();
    const { showToast } = useToast();

    const [availableOrders, setAvailableOrders] = useState([]);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    const [stats, setStats] = useState({
        completed: 0,
        pending: 0,
        available: 0,
        completedRevenue: 0
    });

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isAlarming, setIsAlarming] = useState(false);

    const lastAvailableCount = useRef(0);
    const alarmIntervalRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playIncomingTaskAlarm = () => {
        if (!soundEnabled || isAlarming) return;
        setIsAlarming(true);
        
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'); // Large emergency alarm
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

    const fetchOrders = async () => {
        try {
            const available = await ridersAPI.getAvailable();
            const allAssigned = await ridersAPI.getAssigned();
            setAvailableOrders(available);
            const completedOrdersList = allAssigned.filter(order => order.status === 'delivered');
            const activeAssigned = allAssigned.filter(order => order.status !== 'delivered');
            setAssignedOrders(activeAssigned);
            const completedRevenue = completedOrdersList.reduce((sum, order) => sum + (order?.total || order?.amount || 0), 0);
            setCompletedOrders(completedOrdersList);
            setStats({
                completed: completedOrdersList.length,
                pending: activeAssigned.length,
                available: available.length,
                completedRevenue: completedRevenue
            });
            if (available.length > lastAvailableCount.current && soundEnabled) {
                playIncomingTaskAlarm();
                showToast('🚨 NEW ORDER AVAILABLE!', 'error');
            }
            lastAvailableCount.current = available.length;
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const playSuccessSound = () => {
        if (!soundEnabled) return;
        const ctx = audioContextRef.current;
        if (!ctx) return;
        try {
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(600, now);
            gain.gain.setValueAtTime(0.4, now);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.2);
        } catch (e) {}
    };

    const handleAccept = async (id) => {
        try {
            stopAlarm();
            playSuccessSound();
            await ridersAPI.claim(id);
            showToast('Order accepted!', 'success');
            fetchOrders();
        } catch (err) {
            showToast('Failed to accept order', 'error');
        }
    };

    const handleDelivered = async (id) => {
        try {
            playSuccessSound();
            await ridersAPI.updateStatus(id, 'delivered');
            showToast('Delivered!', 'success');
            fetchOrders();
        } catch (err) {
            showToast('Failed to mark as delivered', 'error');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            playSuccessSound();
            await ridersAPI.updateStatus(id, status);
            showToast(`Status updated!`, 'success');
            fetchOrders();
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => {
            clearInterval(interval);
            stopAlarm();
        };
    }, []);

    if (loading && assignedOrders.length === 0 && availableOrders.length === 0) {
        return <div className="raider-portal-container" style={{ textAlign: 'center' }}><h2>Connecting to Delivery Network...</h2></div>;
    }

    return (
        <div className="raider-portal-container">
            {isAlarming && (
                <div className="alert-banner" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                    🚨 NEW ORDER AVAILABLE 🚨
                    <button onClick={stopAlarm} style={{ marginLeft: '1rem', background: 'white', color: '#ef4444', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Dismiss</button>
                </div>
            )}

            <div className="raider-header raider-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 800, margin: 0 }}>Raider Portal</h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Delivery Network Terminal</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setSoundEnabled(!soundEnabled)} className="btn btn-outline" style={{ padding: '0.75rem' }}>
                        {soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                    </button>
                    <button onClick={logout} className="btn btn-outline" style={{ padding: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
                       <div className="raider-stats-grid">
                {[
                    { label: 'Available', value: availableOrders.length, color: '#10b981', icon: '🔔' },
                    { label: 'Completed', value: stats.completed, color: '#3b82f6', icon: '✅' },
                    { label: 'Revenue', value: `₹${stats.completedRevenue.toLocaleString()}`, color: '#8b5cf6', icon: '💰' },
                    { label: 'Active', value: assignedOrders.length, color: '#f59e0b', icon: '🚀' }
                ].map((stat, index) => (
                    <div key={index} className="raider-card stat-card-premium">
                        <div className="stat-icon-wrapper" style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
                        <div style={{ color: stat.color, fontSize: '2.5rem', fontWeight: 800 }}>{stat.value}</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <h2 style={{ color: 'white', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.8rem', fontWeight: 700 }}>
                <Route size={32} color="#3b82f6" /> Active Deliveries
            </h2>
            
            {assignedOrders.length === 0 ? (
                <div className="raider-card" style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)', padding: '4rem' }}>
                    <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No active deliveries in your queue</p>
                </div>
            ) : assignedOrders.map(order => (
                <div key={order._id || order.id} className="raider-card order-item-premium" style={{ marginBottom: '2rem' }}>
                    <div className="restaurant-name-badge">
                        <Store size={18} />
                        {order.restaurant || (order.items && order.items[0]?.restaurant) || 'Unknown Restaurant'}
                    </div>
                    
                    <div className="address-box">
                        <div style={{ fontSize: '1.1rem', color: '#10b981', display: 'flex', gap: '1rem', marginBottom: '0.8rem', fontWeight: 600 }}>
                            <Package size={20} /> 
                            <span>Pickup: {order.restaurantAddress || 'Check Map'}</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', color: '#ef4444', display: 'flex', gap: '1rem', fontWeight: 600 }}>
                            <MapPin size={20} /> 
                            <span>Drop-off: {order.deliveryAddress || order.address}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                        <div className="status-indicator" style={{ background: order.status === 'out_for_delivery' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: order.status === 'out_for_delivery' ? '#f59e0b' : '#3b82f6' }}>
                            {order.status.replace(/_/g, ' ')}
                        </div>
                        {order.status === 'out_for_delivery' ? (
                            <button onClick={() => handleDelivered(order._id || order.id)} className="btn btn-primary" style={{ padding: '1rem 2.5rem', background: '#10b981', borderRadius: '14px', fontWeight: 700 }}>MARK AS DELIVERED</button>
                        ) : (
                            <button onClick={() => handleStatusUpdate(order._id || order.id, 'out_for_delivery')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', background: '#f59e0b', borderRadius: '14px', fontWeight: 700 }}>PICKED UP</button>
                        )}
                    </div>
                </div>
            ))}

            <button onClick={() => setShowHistory(!showHistory)} className="btn btn-outline" style={{ marginBottom: '2rem', borderRadius: '12px' }}>
                {showHistory ? 'Hide Delivery History' : 'View Delivery History'}
            </button>

            {showHistory && (
                <div className="raider-card" style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Completed Tasks</h2>
                    {completedOrders.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>No successfully delivered orders yet</p> : completedOrders.map(o => (
                        <div key={o._id || o.id} style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>#{o._id?.slice(-6).toUpperCase()}</div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>{o.deliveryAddress}</div>
                            </div>
                            <div style={{ color: '#10b981', fontWeight: 800 }}>₹{o.total}</div>
                        </div>
                    ))}
                </div>
            )}

            <h2 style={{ color: 'white', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.8rem', fontWeight: 700 }}>
                <Zap size={32} color="#f59e0b" /> New Delivery Opportunities
            </h2>
            {availableOrders.length === 0 ? (
                <div className="raider-card" style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)', padding: '4rem' }}>
                    <BellOff size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Scanning for new orders to deliver...</p>
                </div>
            ) : availableOrders.map(order => (
                <div key={order._id || order.id} className="raider-card" style={{ marginBottom: '2rem', border: isAlarming ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="restaurant-name-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <Store size={18} />
                        {order.restaurant || (order.items && order.items[0]?.restaurant) || 'Merchant'}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                        <MapPin size={24} color="#ef4444" />
                        <span>Deliver to: {order.deliveryAddress || order.address}</span>
                    </div>
                    <button onClick={() => handleAccept(order._id || order.id)} className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        ACCEPT DELIVERY TASK
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RaiderDashboard;