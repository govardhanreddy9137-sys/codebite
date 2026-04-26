import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ridersAPI } from '../api.js';
import { Package, Truck, Clock, CheckCircle, AlertTriangle, ShieldCheck, Search, Filter, MoreHorizontal, Trash2, User, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './AdminOrders.css';

const AdminOrders = () => {
    const { orders, updateOrderStatus, deleteOrder } = useCart();
    const { showToast } = useToast();
    const [statusFilter, setStatusFilter] = useState('all');
    const [riders, setRiders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                const data = await ridersAPI.listRiders();
                setRiders(data);
            } catch (err) {
                console.error('Failed to fetch riders:', err);
            }
        };
        fetchRiders();
    }, []);

    const filteredOrders = Array.isArray(orders) ? orders.filter(o => {
        if (!o) return false;
        const matchesSearch = (o._id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (o.deliveryAddress || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'active' && ['pending', 'preparing', 'ready'].includes(o.status)) ||
                             (statusFilter === 'delivered' && o.status === 'delivered');
        return matchesSearch && matchesStatus;
    }) : [];

    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleAssignRider = async (orderId, riderId) => {
        try {
            await ridersAPI.assignRider(orderId, riderId);
            await updateOrderStatus(orderId, 'preparing');
            showToast('Raider assigned and dispatched', 'success');
        } catch (err) {
            showToast('Rider assignment failed', 'error');
        }
    };

    const handleDelete = (orderId) => {
        if (window.confirm('IRREVERSIBLE_ACTION: Delete this order from telemetry?')) {
            deleteOrder(orderId);
            showToast('Order purged from network', 'info');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="admin-container container">
            <div className="splash-grid-overlay" style={{ opacity: 0.1 }} />
            
            <div className="bi-header-compact glass-premium">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '0.25rem' }}>Order Supervision</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>GLOBAL_DISPATCH_MONITOR • ACTIVE_FLOW</p>
                </div>
                <div className="bi-meta-controls">
                    <div className="search-box-bi glass-premium">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="SEARCH_BY_ID_OR_LOC..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="filter-bar-bi">
                {['all', 'active', 'delivered'].map(f => (
                    <button 
                        key={f}
                        className={`filter-btn-bi ${statusFilter === f ? 'active' : ''}`}
                        onClick={() => setStatusFilter(f)}
                    >
                        {f.toUpperCase()} ({orders.filter(o => {
                            if (f === 'all') return true;
                            if (f === 'active') return ['pending', 'preparing', 'ready'].includes(o?.status);
                            return o?.status === 'delivered';
                        }).length})
                    </button>
                ))}
            </div>

            <motion.div 
                className="orders-grid-bi"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence mode="popLayout">
                    {sortedOrders.length === 0 ? (
                        <motion.div className="empty-state-bi glass-premium" layout>
                            <Package size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>WAITING_FOR_NETWORK_DATA...</p>
                        </motion.div>
                    ) : sortedOrders.map(order => (
                        <motion.div key={order._id} className="order-bi-card glass-premium" variants={itemVariants} layout exit={{ opacity: 0, scale: 0.9 }}>
                            <div className="order-bi-side-status" style={{ background: order.status === 'delivered' ? '#10b981' : order.status === 'pending' ? '#ef4444' : '#f59e0b' }} />
                            
                            <div className="order-bi-header">
                                <div className="order-id-bi">
                                    <span className="id-label">TXN_ID</span>
                                    <span className="id-value">#{(order._id || '').slice(-8).toUpperCase()}</span>
                                    {order.status === 'pending' && <span className="urgent-badge">URGENT</span>}
                                </div>
                                <div className="order-bi-revenue">
                                    ₹{order.total?.toLocaleString()}
                                </div>
                            </div>

                            <div className="order-bi-body">
                                <div className="order-bi-info-row">
                                    <User size={16} /><span className="auth-label">CLIENT:</span>
                                    <span className="auth-value" style={{ color: '#fff', fontWeight: 700 }}>{order.customerName || `USER_${order.userId?.slice(-6)}`}</span>
                                    {order.customerPhone && <span className="auth-phone"> | {order.customerPhone}</span>}
                                </div>
                                <div className="order-bi-info-row" style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                                    <MapPin size={18} style={{ color: '#ef4444' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="auth-label" style={{ fontSize: '0.7rem' }}>DELIVERY_ADDRESS:</span>
                                        <span className="auth-value" style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{order.deliveryAddress || order.deliveryRoom || 'N/A'}</span>
                                    </div>
                                </div>
                                
                                {order.rider?.name && (
                                    <div className="order-bi-info-row" style={{ marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <Truck size={18} style={{ color: '#10b981' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="auth-label" style={{ fontSize: '0.7rem', color: '#10b981' }}>ASSIGNED_RAIDER:</span>
                                            <span className="auth-value" style={{ color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>{order.rider.name.toUpperCase()}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="order-bi-items" style={{ marginTop: '1rem' }}>
                                    {order.items?.map((it, i) => (
                                        <span key={i} className="bi-item-tag">{it.quantity}x {it.name}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="order-bi-actions">
                                <div className="bi-status-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button 
                                        className={`btn ${order.status === 'preparing' ? 'btn-primary' : 'btn-secondary'}`} 
                                        style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleStatusChange(order._id, 'preparing')}
                                    >
                                        Preparing
                                    </button>
                                    <button 
                                        className={`btn ${order.status === 'ready' ? 'btn-primary' : 'btn-secondary'}`} 
                                        style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleStatusChange(order._id, 'ready')}
                                    >
                                        Prepared
                                    </button>
                                    <button 
                                        className={`btn ${order.status === 'delivering' ? 'btn-primary' : 'btn-secondary'}`} 
                                        style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleStatusChange(order._id, 'delivering')}
                                    >
                                        Delivering
                                    </button>
                                    <button 
                                        className={`btn ${order.status === 'delivered' ? 'btn-primary' : 'btn-secondary'}`} 
                                        style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem' }}
                                        onClick={() => handleStatusChange(order._id, 'delivered')}
                                    >
                                        Delivered
                                    </button>
                                </div>

                                <div className="bi-select-wrapper">
                                    <select 
                                        className="bi-rider-select"
                                        value={order.riderId || ''}
                                        onChange={(e) => handleAssignRider(order._id, e.target.value)}
                                        style={{ border: order.riderId ? '1px solid #10b981' : '1px solid #ef4444' }}
                                    >
                                        <option value="">ASSIGN_RAIDER</option>
                                        {riders.map(r => (
                                            <option key={r._id} value={r._id}>{r.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                <button className="bi-delete-btn" onClick={() => handleDelete(order._id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            {order.rider?.name && (
                                <div className="bi-dispatch-status">
                                    <Truck size={14} /> <span>DISPATCHED_VIA_{order.rider.name.toUpperCase()}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <div className="bi-footer-status">
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <span>NETWORK_VISIBILITY: 100%</span>
                    <span>DISPATCH_LATENCY: OPTIMAL</span>
                    <span>ENCRYPTION: SHIELDED</span>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
