import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Phone, Package, Bell, BellOff, LogOut, Route, Zap, Store } from 'lucide-react';
import { ridersAPI, ordersAPI } from '../api.js';
import { useToast } from '../context/ToastContext';

const RaiderDashboard = () => {
    const { logout } = useAuth();
    const { showToast } = useToast();

    const [availableOrders, setAvailableOrders] = useState([]);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    // ✅ FIXED stats - will be updated from API
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

    // ✅ SAFE AudioContext
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

    // ✅ FIXED alarm sound
    const playIncomingTaskAlarm = () => {
        if (!soundEnabled || isAlarming) return;

        const ctx = audioContextRef.current;
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume(); // 🔥 IMPORTANT FIX
        }

        setIsAlarming(true);

        if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);

        const playSound = () => {
            try {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.5, now);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(now + 0.3);
            } catch (e) {
                console.log('Audio error', e);
            }
        };

        playSound();
        alarmIntervalRef.current = setInterval(playSound, 1000);
    };

    const stopAlarm = () => {
        setIsAlarming(false);
        if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
        }
    };

    // ✅ FIXED API handling
    const fetchOrders = async () => {
        try {
            const available = await ridersAPI.getAvailable();
            const allAssigned = await ridersAPI.getAssigned();

            setAvailableOrders(available);
            
            // Calculate completed orders from assigned orders that have 'delivered' status
            const completedOrdersList = allAssigned.filter(order => order.status === 'delivered');
            const activeAssigned = allAssigned.filter(order => order.status !== 'delivered');
            
            setAssignedOrders(activeAssigned);
            
            const completedCount = completedOrdersList.length;
            const completedRevenue = completedOrdersList.reduce((sum, order) => sum + (order?.total || order?.amount || 0), 0);

            setCompletedOrders(completedOrdersList);
            setStats({
                completed: completedCount,
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
            showToast('Server error fetching orders', 'error');
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
        } catch (e) {
            console.error(e);
        }
    };

    const handleAccept = async (id) => {
        try {
            stopAlarm();
            playSuccessSound();
            await ridersAPI.claim(id);
            showToast('Order accepted!', 'success');
            fetchOrders();
        } catch (err) {
            console.error('Failed to accept order:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to accept order';
            showToast(errorMessage, 'error');
        }
    };

    const handleDelivered = async (id) => {
        try {
            playSuccessSound();
            await ridersAPI.updateStatus(id, 'delivered');
            showToast('Delivered!', 'success');
            fetchOrders();
        } catch (err) {
            console.error('Failed to mark as delivered:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to mark as delivered';
            showToast(errorMessage, 'error');
        }
    };

    // ✅ FIXED interval (runs once)
    useEffect(() => {
        fetchOrders();

        const interval = setInterval(fetchOrders, 3000);

        return () => {
            clearInterval(interval);
            stopAlarm();
        };
    }, []);

    if (loading && assignedOrders.length === 0 && availableOrders.length === 0) {
        return <h2 style={{ textAlign: 'center' }}>Loading...</h2>;
    }

    return (
        <div className="raider-portal-container" style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
            minHeight: '100vh',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>

            {/* ALERT */}
            {isAlarming && (
                <div className="alert-banner" style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
                }}>
                    🚨 NEW ORDER AVAILABLE 🚨
                </div>
            )}

            {/* HEADER */}
            <div className="raider-header" style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '2rem',
                        fontWeight: 800,
                        margin: 0
                    }}>Raider Dashboard</h1>
                    <p style={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        marginTop: '0.5rem',
                        fontSize: '0.9rem'
                    }}>CodeBite Delivery Network</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setSoundEnabled(!soundEnabled)} style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}>
                        {soundEnabled ? <Bell /> : <BellOff />}
                    </button>

                    <button onClick={logout} style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        color: '#ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}>
                        <LogOut />
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {[
                    { label: 'Available', value: availableOrders.length, color: '#10b981', icon: '🔔' },
                    { label: 'Completed', value: stats.completed, color: '#3b82f6', icon: '✅' },
                    { label: 'Revenue', value: `₹${stats.completedRevenue.toLocaleString()}`, color: '#8b5cf6', icon: '💰' },
                    { label: 'Active', value: assignedOrders.length, color: '#f59e0b', icon: '🚀' }
                ].map((stat, index) => (
                    <div key={index} style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <div style={{ 
                            color: stat.color, 
                            fontSize: '2rem', 
                            fontWeight: 800,
                            lineHeight: 1
                        }}>{stat.value}</div>
                        <div style={{ 
                            color: 'rgba(255, 255, 255, 0.6)', 
                            fontSize: '0.85rem',
                            marginTop: '0.25rem'
                        }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ACTIVE ORDERS */}
            <h2 style={{ 
                color: 'white', 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <Route size={28} color="#3b82f6" />
                Active Deliveries
            </h2>
            {assignedOrders.length === 0 ? (
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.6)'
                }}>
                    No active deliveries
                </div>
            ) : assignedOrders.map(order => (
                <div key={order._id || order.id} className="card" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ 
                            fontWeight: 700, 
                            color: '#3b82f6', 
                            marginBottom: '0.5rem',
                            fontSize: '1.1rem'
                        }}>
                            <Store size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            {order.restaurant || order.restaurantName || 'Restaurant'}
                        </div>
                        <div style={{ 
                            fontWeight: 600, 
                            color: '#10b981', 
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Package size={14} />
                            {order.restaurantAddress || order.pickupAddress || 'Pickup Location'}
                        </div>
                        <div style={{ 
                            fontWeight: 600, 
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <MapPin size={14} />
                            {order.deliveryAddress || order.address}
                        </div>
                    </div>
                    <a href={`tel:${order.customerPhone}`} style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '1rem'
                    }}>
                        <Phone size={16} />
                        {order.customerPhone}
                    </a>
                    <button onClick={() => handleDelivered(order._id || order.id)} style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem 2rem',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.3s ease'
                    }}>
                        Delivered
                    </button>
                </div>
            ))}

            {/* DELIVERY HISTORY TOGGLE */}
            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => setShowHistory(!showHistory)} style={{
                    background: showHistory ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                    border: showHistory ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem 2rem',
                    color: showHistory ? '#8b5cf6' : '#3b82f6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {showHistory ? 'Hide History' : 'Show Delivery History'}
                    {showHistory ? <Package size={18} /> : <Route size={18} />}
                </button>
            </div>

            {/* DELIVERY HISTORY */}
            {showHistory && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)'
                }}>
                    <h2 style={{ 
                        color: 'white', 
                        fontSize: '1.5rem', 
                        fontWeight: 700, 
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <Route size={28} color="#8b5cf6" />
                        Delivery History
                    </h2>
                    {completedOrders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.6)',
                            padding: '2rem'
                        }}>
                            No completed deliveries yet
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {completedOrders.map(order => (
                                <div key={order._id || order.id} style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#8b5cf6', marginBottom: '0.25rem' }}>
                                            Order #{(order._id || order.id || '').toString().slice(-6).toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                            {order.restaurant || order.restaurantName || 'Restaurant'} → {order.deliveryAddress || order.address}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
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
                </div>
            )}

            {/* NEW ORDERS */}
            <h2 style={{ 
                color: 'white', 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <Zap size={28} color="#f59e0b" />
                New Orders
            </h2>
            {availableOrders.length === 0 ? (
                <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.6)'
                }}>
                    No new orders available
                </div>
            ) : availableOrders.map(order => (
                <div key={order._id || order.id} className="card" style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
                    border: isAlarming ? '2px solid #ef4444' : '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isAlarming ? '0 8px 32px rgba(239, 68, 68, 0.2)' : '0 8px 32px rgba(245, 158, 11, 0.1)',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ 
                        fontWeight: 700, 
                        color: '#f59e0b', 
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Store size={18} />
                        {order.restaurant || order.restaurantName || 'Restaurant'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.5rem' }}>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={14} />
                                PICKUP LOCATION
                            </div>
                            <div style={{ fontSize: '0.85rem', paddingLeft: '1.25rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                {order.restaurantAddress || order.restaurant || 'Restaurant Location'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MapPin size={14} />
                                DELIVERY ADDRESS
                            </div>
                            <div style={{ fontSize: '0.85rem', paddingLeft: '1.25rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                                {order.deliveryAddress || order.address}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => handleAccept(order._id || order.id)} style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem 2rem',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: '1rem',
                        transition: 'all 0.3s ease'
                    }}>
                        ACCEPT ORDER
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RaiderDashboard;