import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersAPI } from '../api.js';
import { Phone, MapPin, Clock, ChevronLeft, Navigation, Activity, CheckCircle2 } from 'lucide-react';
import OrderMap from '../components/OrderMap';
import './OrderTracking.css';

const OrderTracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eta, setEta] = useState(15);
    const [statusStep, setStatusStep] = useState(0); 
    const [riderPos, setRiderPos] = useState([12.9616, 77.5846]); // Bangalore Default

    useEffect(() => {
        if (!id) return;
        
        const fetchUpdates = async (isInitial = false) => {
            if (isInitial) setLoading(true);
            try {
                const data = await ordersAPI.getById(id);
                setOrder(data);
                
                if (data.status === 'preparing') setStatusStep(0);
                else if (data.status === 'ready' || data.status === 'picked_up') setStatusStep(1);
                else if (data.status === 'delivered') setStatusStep(2);

                if (data.rider?.lat && data.rider?.lng) {
                    setRiderPos([data.rider.lat, data.rider.lng]);
                } else {
                    // Simulate movement if no real GPS
                    const startLat = 12.9516, startLng = 77.5746; // Kitchen
                    const endLat = 12.9716, endLng = 77.5946; // Customer
                    const progress = data.status === 'preparing' ? 0 : data.status === 'picked_up' ? 0.5 : data.status === 'delivered' ? 1.0 : 0.2;
                    setRiderPos([
                        startLat + (endLat - startLat) * progress,
                        startLng + (endLng - startLng) * progress
                    ]);
                }

                if (data.estimatedDeliveryTime) {
                    const minutes = Math.ceil((new Date(data.estimatedDeliveryTime) - new Date()) / 60000);
                    setEta(Math.max(1, minutes));
                }
            } catch (err) {
                console.error('Radar failure:', err);
                if (isInitial) setError('LINK_FAILURE: Uplink Synchronizing...');
            } finally {
                if (isInitial) setLoading(false);
            }
        };

        fetchUpdates(true);
        const interval = setInterval(() => fetchUpdates(false), 3000); 
        return () => clearInterval(interval);
    }, [id]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    };

    if (loading) return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Activity size={48} color="var(--primary)" />
            </motion.div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '2px' }}>INITIALIZING_RADAR_UPLINK...</h2>
        </div>
    );

    return (
        <motion.div 
            className="tracking-container container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="tracking-header" variants={itemVariants}>
                <button className="back-btn" onClick={() => navigate('/orders')}>
                    <ChevronLeft size={24} />
                </button>
                <div className="header-info">
                    <h1>Track Order</h1>
                    <p>Order #{(order?._id || '').slice(-8).toUpperCase()}</p>
                </div>
                <div className="eta-badge">
                    <Clock size={20} />
                    <span>ETA: {eta} mins</span>
                </div>
            </motion.div>

            <motion.div className="tracking-main" variants={itemVariants}>
                <div className="map-section section-card">
                    <div className="card-header">
                        <Navigation size={20} color="var(--primary)" />
                        <h3>Live Location</h3>
                    </div>
                    
                    <div className="map-wrapper">
                        <OrderMap 
                            orders={[order]} 
                            riderLocation={riderPos}
                            customerLocation={[12.9716, 77.5946]}
                            restaurantLocation={[12.9516, 77.5746]}
                        />
                    </div>
                </div>

                <div className="tracking-sidebar">
                    <motion.div className="rider-info-card section-card" whileHover={{ y: -5 }}>
                        <div className="rider-avatar">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.rider?.name || 'Rider'}`} alt="Rider" />
                        </div>
                        <div className="details">
                            <p className="label">Your Delivery Partner</p>
                            <h3>{order.rider?.name || 'Assigned Rider'}</h3>
                            <div className="rating">⭐⭐⭐⭐⭐</div>
                        </div>
                        <a href={`tel:${order.rider?.phone || '0000000000'}`} className="call-action">
                            <Phone size={24} />
                        </a>
                    </motion.div>

                    <motion.div className="order-summary section-card">
                        <h3>Order Details</h3>
                        <div className="items-list">
                            {order.items?.map((item, i) => (
                                <div key={i} className="summary-item">
                                    <span>{item.quantity}x {item.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="total-line">
                            <span>Amount Paid:</span>
                            <span>₹{order.total}</span>
                        </div>
                    </motion.div>

                    <div className="status-progress">
                        <div className={`step ${statusStep >= 0 ? 'active' : ''}`}>
                            <div className="dot" />
                            <span>Kitchen preparing</span>
                        </div>
                        <div className={`step ${statusStep >= 1 ? 'active' : ''}`}>
                            <div className="dot" />
                            <span>Rider en route</span>
                        </div>
                        <div className={`step ${statusStep >= 2 ? 'active' : ''}`}>
                            <div className="dot" />
                            <span>Delivered successfully</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OrderTracking;
