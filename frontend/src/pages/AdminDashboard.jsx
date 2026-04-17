import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFood } from '../context/FoodContext';
import { uploadAPI, ordersAPI, foodsAPI, usersAPI } from '../api.js';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { 
    Utensils, LayoutList, Clock, CheckCircle, 
    TrendingUp, Store, ChevronRight, Activity, 
    DollarSign, Package, AlertCircle, Camera, Edit, Save, X, Users, Phone, MapPin, Download, Database
} from 'lucide-react';

const AdminDashboard = () => {
    const { foods, restaurants, updateRestaurantStatus } = useFood();
    const { orders } = useCart();
    
    // Image editing states
    const [editingImage, setEditingImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [showDeliveryHistory, setShowDeliveryHistory] = useState(false);

    const pendingOrders = Array.isArray(orders) ? orders.filter(o => (o?.status || 'pending') === 'pending').length : 0;
    const preparingOrders = Array.isArray(orders) ? orders.filter(o => o?.status === 'preparing').length : 0;
    const readyOrders = Array.isArray(orders) ? orders.filter(o => o?.status === 'ready').length : 0;
    const deliveredOrders = Array.isArray(orders) ? orders.filter(o => o?.status === 'delivered').length : 0;
    const revenue = Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order?.total || order?.amount || 0), 0) : 0;
    const completedRevenue = Array.isArray(orders) ? orders.filter(o => o?.status === 'delivered').reduce((sum, order) => sum + (order?.total || order?.amount || 0), 0) : 0;
    const completedOrdersList = Array.isArray(orders) ? orders.filter(o => o?.status === 'delivered') : [];

    const topItems = (() => {
        const counts = {};
        if (Array.isArray(orders)) {
            orders.forEach(o => {
                (o.items || []).forEach(item => {
                    const key = item.name || 'Unknown';
                    counts[key] = (counts[key] || 0) + (item.quantity || 1);
                });
            });
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    })();

    // Get customer data from orders
    const customerData = (() => {
        const customers = {};
        if (Array.isArray(orders)) {
            orders.forEach(o => {
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

    // Get weekly orders data
    const weeklyOrders = (() => {
        const weekData = {};
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        if (Array.isArray(orders)) {
            orders.forEach(o => {
                const orderDate = new Date(o.createdAt || o.date);
                if (orderDate >= weekAgo && orderDate <= now) {
                    const dayKey = orderDate.toLocaleDateString('en-US', { weekday: 'long' });
                    if (!weekData[dayKey]) {
                        weekData[dayKey] = { count: 0, total: 0 };
                    }
                    weekData[dayKey].count += 1;
                    weekData[dayKey].total += o.total || o.amount || 0;
                }
            });
        }
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.map(day => ({
            day,
            count: weekData[day]?.count || 0,
            total: weekData[day]?.total || 0
        }));
    })();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('image', file);
        
        try {
            const res = await uploadAPI.post(formDataFile);
            if (res.success) {
                setImageUrl(res.imageUrl);
            } else {
                alert(res.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Connection error during upload');
        }
    };

    const handleEditImage = (item, currentImage) => {
        setEditingImage(item);
        setImageUrl(currentImage);
        setShowImageEditor(true);
    };

    const handleSaveImage = async () => {
        if (editingImage && imageUrl) {
            try {
                console.log('Updating image for:', editingImage.name, 'to:', imageUrl);
                const { foodsAPI } = await import('../api');
                const foodItem = foods.find(f => f.name === editingImage.name);
                if (foodItem) {
                    await foodsAPI.update(foodItem._id || foodItem.id, { image: imageUrl });
                    alert(`Image updated for ${editingImage.name}`);
                    window.location.reload(); // Refresh to show updated image
                }
            } catch (err) {
                console.error('Failed to update image:', err);
                alert('Failed to update image: ' + (err.message || 'Unknown error'));
            }
        }
        setEditingImage(null);
        setImageUrl('');
        setShowImageEditor(false);
    };

    const handleCancelEdit = () => {
        setEditingImage(null);
        setImageUrl('');
        setShowImageEditor(false);
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                orders: orders,
                foods: foods,
                restaurants: restaurants,
                customerData: customerData,
                weeklyOrders: weeklyOrders,
                stats: {
                    pendingOrders,
                    preparingOrders,
                    readyOrders,
                    deliveredOrders,
                    revenue
                }
            };

            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `codebite_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert('Backup downloaded successfully!');
        } catch (err) {
            console.error('Backup failed:', err);
            alert('Backup failed: ' + err.message);
        } finally {
            setIsBackingUp(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const stats = [
        { label: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#10b981', trend: '+12%' },
        { label: 'Completed Revenue', value: `₹${completedRevenue.toLocaleString()}`, icon: <CheckCircle size={20} />, color: '#059669', trend: 'Delivered' },
        { label: 'Pending Orders', value: pendingOrders, icon: <Clock size={20} />, color: '#f59e0b', trend: 'Active' },
        { label: 'Preparing Orders', value: preparingOrders, icon: <Activity size={20} />, color: '#3b82f6', trend: 'Cooking' },
        { label: 'Completed Orders', value: deliveredOrders, icon: <CheckCircle size={20} />, color: '#059669', trend: 'Done' }
    ];

    return (
        <div className="container animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {stats.map((s, idx) => (
                            <motion.div key={s.label} variants={itemVariants} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: s.color }}>{s.icon}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{s.label}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: s.color, marginTop: '0.5rem' }}>{s.trend}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Delivery History Toggle */}
            <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <button onClick={() => setShowDeliveryHistory(!showDeliveryHistory)} style={{
                    background: showDeliveryHistory ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                    border: showDeliveryHistory ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem 2rem',
                    color: showDeliveryHistory ? '#8b5cf6' : '#3b82f6',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {showDeliveryHistory ? 'Hide Delivery History' : 'Show Delivery History'}
                    {showDeliveryHistory ? <Package size={18} /> : <CheckCircle size={18} />}
                </button>
            </motion.div>

            {/* Delivery History */}
            {showDeliveryHistory && (
                <motion.div variants={itemVariants} className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '3rem' }}>
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
                                            {order.restaurant || order.restaurantName || 'Restaurant'} → {order.deliveryAddress || order.address}
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

            {/* Restaurant Status */}
            <motion.div variants={itemVariants} className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Store size={28} color="#FF3008" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Restaurant Status</h2>
                    </div>
                    <Link to="/admin/food" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Manage Menu</Link>
                </div>

                <div className="restaurant-scroll-container">
                    {Array.isArray(restaurants) && restaurants.map(res => {
                        const isClosed = !res.isOpen;
                        return (
                            <div
                                key={res._id || res.id || res.name}
                                className={`restaurant-visual-card glass ${isClosed ? 'is-closed' : ''}`}
                                onClick={() => updateRestaurantStatus(res.id || res._id, { isOpen: !res.isOpen })}
                            >
                                <div className="rest-image-wrapper">
                                    <img src={res.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'} alt={res.name} />
                                    <div className="rest-overlay"></div>
                                    {isClosed && <div className="closed-tag-overlay">CLOSED</div>}
                                    {res.offer && <div className="rest-offer-tag">{res.offer}</div>}
                                    <div className="rest-rating-float">
                                        <span style={{ fontSize: '0.8rem' }}>4.0</span>
                                    </div>
                                </div>
                                <div className="rest-info">
                                    <h3>{res.name}</h3>
                                    <p className="rest-cuisine">{res.cuisine || 'Quality Food • Hot'}</p>
                                    <div className="rest-meta">
                                        <span className="rest-location">0.5 km away</span>
                                        {isClosed && <span className="opens-tag">Opens {res.opensAt}</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Alert for Pending Orders */}
            {pendingOrders > 0 && (
                <motion.div variants={itemVariants} className="glass" style={{ padding: '1.25rem 2rem', borderRadius: '24px', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)' }}>
                    <div style={{ padding: '10px', background: '#f59e0b', borderRadius: '12px', color: '#000' }}>
                        <AlertCircle size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '1.1rem' }}>{pendingOrders} Orders Awaiting Action</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Click manage to start processing these requests.</p>
                    </div>
                    <Link to="/admin/orders" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '12px' }}>
                        Manage Orders
                    </Link>
                </motion.div>
            )}

            {/* Main Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((s, idx) => (
                    <motion.div key={s.label} variants={itemVariants} className="glass" style={{ padding: '24px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: s.color, width: '60px', height: '60px', opacity: 0.05, borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: s.color }}>
                                {s.icon}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color, background: `${s.color}15`, padding: '4px 8px', borderRadius: '6px' }}>
                                {s.trend}
                            </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{s.value}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {/* Popular Items */}
                <motion.div variants={itemVariants} className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <TrendingUp size={20} color="#FF3008" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Trending Today</h2>
                        </div>
                        <Link to="/admin/food" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View Menu</Link>
                    </div>
                    {topItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No items sold yet</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {topItems.map(([name, count], i) => (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: i === 0 ? '#fbbf24' : 'var(--text-secondary)' }}>
                                        {i + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{name}</div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(count / topItems[0][1]) * 100}%` }}
                                                style={{ height: '100%', background: i === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.2)' }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEditImage({ name }, foods.find(f => f.name === name)?.image || '')}
                                        style={{
                                            background: 'none',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            padding: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                        title="Edit image"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <div style={{ fontWeight: 700, color: 'white' }}>{count}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Customer Data Section */}
                <motion.div variants={itemVariants} className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Users size={20} color="#10b981" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customer Data</h2>
                        </div>
                        <Link to="/admin/users" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
                    </div>
                    {customerData.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No customer data yet</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {customerData.map((customer, i) => (
                                <div key={i} style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    borderRadius: '12px', 
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Users size={16} />
                                            {customer.name}
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#10b981' }}>₹{customer.totalSpent}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                        <Phone size={14} />
                                        {customer.phone}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                                        <MapPin size={14} />
                                        {customer.address}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {customer.orders} order{customer.orders > 1 ? 's' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Weekly Orders Section */}
                <motion.div variants={itemVariants} className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Activity size={20} color="#f59e0b" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Weekly Orders</h2>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last 7 days</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {weeklyOrders.map((dayData, i) => (
                            <div key={i} style={{ 
                                background: dayData.count > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)', 
                                borderRadius: '12px', 
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: dayData.count > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{dayData.day}</div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, color: dayData.count > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>
                                        {dayData.count} order{dayData.count !== 1 ? 's' : ''}
                                    </div>
                                    <div style={{ fontWeight: 700, color: '#10b981' }}>
                                        ₹{dayData.total}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Fast Action Section */}
                <motion.div variants={itemVariants} className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Package size={24} color="#FF3008" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quick Actions</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <Link to="/admin/food" style={{ textDecoration: 'none' }}>
                            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer' }}>
                                <LayoutList size={32} color="#FF3008" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>Add New Item</div>
                            </motion.div>
                        </Link>

                        <motion.div 
                            variants={itemVariants} 
                            whileHover={{ scale: 1.02 }} 
                            className="glass" 
                            style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer' }}
                            onClick={handleBackup}
                        >
                            <Database size={32} color="#8b5cf6" style={{ marginBottom: '0.5rem' }} />
                            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{isBackingUp ? 'Backing up...' : 'Backup Data'}</div>
                        </motion.div>

                        <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
                            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer' }}>
                                <Clock size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>View Orders</div>
                            </motion.div>
                        </Link>

                        <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
                            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer' }}>
                                <Activity size={32} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>View Orders</div>
                            </motion.div>
                        </Link>

                        <Link to="/admin/food" style={{ textDecoration: 'none' }}>
                            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer' }}>
                                <TrendingUp size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>Analytics</div>
                            </motion.div>
                        </Link>
                    </div>
                </motion.div>

                {/* User Management */}
                <Link to="/admin/users" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CheckCircle size={24} color="#059669" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>User Management</h2>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                    </motion.div>
                </Link>
            </div>

            {/* Image Editor Modal */}
            {showImageEditor && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '20px',
                            padding: '2rem',
                            width: '90%',
                            maxWidth: '500px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>
                                Edit Image - {editingImage?.name}
                            </h3>
                            <button
                                onClick={handleCancelEdit}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '0.5rem'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                Image URL / Path
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Enter image URL..."
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                />
                                <input 
                                    type="file" 
                                    id="file-upload-legacy" 
                                    hidden 
                                    onChange={handleImageUpload} 
                                    accept="image/*"
                                />
                                <label htmlFor="file-upload-legacy" className="btn btn-primary" style={{ cursor: 'pointer', padding: '0 1rem', display: 'flex', alignItems: 'center', margin: 0 }}>
                                    BROWSE
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleCancelEdit}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveImage}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--primary)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Save size={16} />
                                Save Image
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;
