import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChefHat, History, MapPin, Gift, RotateCcw, TrendingUp, Truck, Package, ShoppingBag, ArrowRight, XCircle, Heart } from 'lucide-react';
import { useFood } from '../context/FoodContext';
import { useToast } from '../context/ToastContext';
import './OrderHistory.css';

const STATUS_LABELS = { 
    pending: 'Placed', 
    confirmed: 'Confirmed', 
    preparing: 'Preparing', 
    ready: 'Ready', 
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
};

const OrderHistory = () => {
    const { orders, addToCart, updateOrderStatus } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useFood();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const currentUserId = user?.id || user?._id;
    
    const userOrders = Array.isArray(orders) ? orders.filter(o => {
        const orderUserId = o.userId?._id?.toString() || o.userId?.id?.toString() || o.userId?.toString() || o.userId;
        return orderUserId === currentUserId?.toString();
    }) : [];
    
    const handleReorder = (order) => {
        (order.items || []).forEach(item => addToCart(item));
        showToast('Items added to cart!', 'success');
        navigate('/cart');
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Cancel this order and get a refund to BitePoints?')) {
            try {
                await updateOrderStatus(orderId, 'cancelled');
                showToast('Order cancelled. Refund added to BitePoints! 💰', 'success');
            } catch (err) {
                showToast('Failed to cancel order.', 'error');
            }
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('en-IN', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (userOrders.length === 0) {
        return (
            <div className="container text-center" style={{ padding: '4rem 1rem' }}>
                <History size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
                <h2>No Orders Yet</h2>
                <p>Your order history is empty. Start order some delicious food!</p>
                <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    Browse Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div className="orders-header glass-premium">
                <h1 className="orders-title">Transaction Archive</h1>
                <p className="orders-subtitle">Premium tracking for your gourmet workspace experiences.</p>
            </div>

            <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {userOrders.map((order) => (
                    <div key={order._id || order.id} className="premium-order-card glass">
                        <div className="order-top-bar">
                            <div className="order-id-group">
                                <span className="order-label">ORDERREF_</span>
                                <span className="order-id">#{(order._id || order.id || '').toString().slice(-8).toUpperCase()}</span>
                            </div>
                            <div className={`premium-status-badge ${order.status}`}>
                                {STATUS_LABELS[order.status] || order.status}
                            </div>
                        </div>

                        <div className="order-mid-content">
                            <div className="order-items-grid">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="order-item-row" style={{ position: 'relative' }}>
                                        <div className="item-main-info" style={{ flex: 1 }}>
                                            <span className="item-qty">{item.quantity}x</span>
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-origin">from <b>{item.restaurant || 'Main Kitchen'}</b></span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button 
                                                onClick={() => {
                                                    toggleWishlist(item._id || item.id);
                                                    showToast(isInWishlist(item._id || item.id) ? 'Removed from favorites' : 'Added to favorites!', 'success');
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: isInWishlist(item._id || item.id) ? '#ff4b81' : 'rgba(255, 255, 255, 0.2)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <Heart size={18} fill={isInWishlist(item._id || item.id) ? '#ff4b81' : 'none'} />
                                            </button>
                                            <div className="item-price">₹{item.price * item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-meta-info">
                                <div className="meta-tile">
                                    <Clock size={16} />
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                                {order.deliveryAddress && (
                                    <div className="meta-tile">
                                        <MapPin size={16} />
                                        <span>{order.deliveryAddress}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="order-bottom-bar">
                            <div className="order-total-group">
                                <label>Premium Settlement</label>
                                <div className="total-amount">₹{Number(order.total || 0).toFixed(2)}</div>
                                <div className="total-meta">{(order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0)} units verified</div>
                            </div>
                            
                            <div className="order-cta-group">
                                {order.status === 'pending' && (
                                    <button className="btn btn-outline btn-cancel" onClick={() => handleCancelOrder(order._id || order.id)}>
                                        <XCircle size={18} /> ABORT_ORDER
                                    </button>
                                )}
                                <button className="btn btn-primary" onClick={() => handleReorder(order)}>
                                    <RotateCcw size={18} /> REORDER_IMPACT
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
