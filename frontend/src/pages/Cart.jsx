import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import { Plus, Minus, CreditCard, X, Gift, Trash2, ShoppingBag, Users, MapPin, ArrowRight, ShieldCheck, Phone, Store, Home, Briefcase, Building, Clock, Heart, Zap } from 'lucide-react';
import Payment from '../components/Payment';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import OfficeMap from '../components/OfficeMap';
import CheckoutModal from '../components/CheckoutModal';
import { INDIAN_STATES, STATE_CITY_MAP, CITY_AREA_MAP, DELIVERY_TYPES } from '../data/locations';
import './Cart.css';

const Cart = () => {
    const { 
        cart, 
        removeFromCart, 
        placeOrder, 
        showPayment, 
        currentOrder, 
        handlePaymentSuccess, 
        handlePaymentCancel 
    } = useCart();
    const location = useLocation();
    const { user, updateUser, hasWeeklyPass } = useAuth();
    const { toggleWishlist, isInWishlist } = useFood();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [groupCode, setGroupCode] = useState('');
    const [deliveryRoom, setDeliveryRoom] = useState('');
    const [addressDetails, setAddressDetails] = useState(user?.address || '');
    const [isGift, setIsGift] = useState(false);
    const [giftRecipient, setGiftRecipient] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [deliveryType, setDeliveryType] = useState('Home'); 
    
    // Cascading Location States
    const [selectedState, setSelectedState] = useState('Andhra Pradesh');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    
    const [phone, setPhone] = useState(user?.phone || '');
    const [officeName, setOfficeName] = useState('');

    const personalTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
    const hasPassInCart = cart.some(item => item.isPass);
    const isPassApplicable = Boolean(hasWeeklyPass) || hasPassInCart;
    const deliveryCharge = isPassApplicable ? 0 : 25; // Free delivery with pass or if buying a pass
    
    // One item free (the most expensive one) for subscribers
    const freeItemsAvailable = isPassApplicable ? cart.filter(i => !i.isPass) : [];
    const freeItemValue = freeItemsAvailable.length > 0 ? Math.max(...freeItemsAvailable.map(i => Number(i.price) || 0)) : 0;
    
    const discountApplied = freeItemValue;
    const payableSubtotal = personalTotal - discountApplied;
    const tax = payableSubtotal * 0.02;
    const computedTotal = payableSubtotal + tax + deliveryCharge;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('checkout') === 'true' && cart.length > 0) {
            setIsCheckoutOpen(true);
        }
    }, [location, cart.length]);

    const handleCheckout = () => {
        if (cart.length === 0) return;
        if (!selectedState || !selectedCity || !selectedArea) {
            showToast('Please select your State, City, and Area.', 'warning');
            return;
        }
        if (!addressDetails.trim()) {
            showToast('Please provide specific address details (Street/House/Room).', 'warning');
            return;
        }
        const trimmedPhone = phone.trim() || user?.phone?.trim();
        if (!trimmedPhone) {
            showToast('Please provide a valid contact number.', 'warning');
            return;
        }
        setIsCheckoutOpen(true);
    };

    const confirmCheckout = async () => {
        const fullAddress = `${deliveryType} Delivery: ${addressDetails}, ${selectedArea}, ${selectedCity}, ${selectedState}`;
        const trimmedPhone = phone.trim() || user?.phone?.trim();
        const result = await placeOrder(user.id, {
            weeklyPassActive: isPassApplicable,
            deliveryAddress: fullAddress,
            state: selectedState,
            city: selectedCity,
            area: selectedArea,
            deliveryType,
            customerPhone: trimmedPhone,
            officeName: officeName.trim(),
            isGift,
            giftRecipient: isGift ? giftRecipient : '',
            total: computedTotal,
            tax: tax,
            deliveryCharge: deliveryCharge,
            discount: discountApplied
        });
        if (!result?.ok) return result;
        setIsCheckoutOpen(false);
        return { ok: true };
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
                <ShoppingBag size={80} style={{ color: '#ccc', marginBottom: '20px' }} />
                <h2>Your shopping bag is empty.</h2>
                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/menu')}>Start Exploring</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div className="cart-header-premium glass-premium" style={{ marginBottom: '3rem', padding: '3rem', borderRadius: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div className="logo-pulse">
                        <ShoppingBag size={48} color="var(--primary)" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px' }}>YOUR SELECTION_</h1>
                        <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>V2.1 PRE-PRODUCTION CHECKOUT</p>
                    </div>
                </div>
            </div>

            <div className="cart-layout">
                {/* Left Side: Items */}
                <div className="items-column">
                    <div className="glass" style={{ borderRadius: '32px', overflow: 'hidden', padding: '2rem' }}>
                        <h3 className="section-title">Verified Manifest ({cart.length} items)</h3>
                        <div className="cart-items-scroll">
                                {cart.map((item) => {
                                    const isMostExpensive = isPassApplicable && !item.isPass && item.price === freeItemValue;
                                    return (
                                        <div key={item._id || item.id} className={`premium-cart-item ${item.isPass ? 'pass-item' : ''}`}>
                                            <div className="item-visual">
                                                <img src={item.image} alt={item.name} />
                                                <div className="item-qty-badge">{item.quantity}</div>
                                                {item.isPass && <div className="pass-label-overlay">MEAL_PASS</div>}
                                            </div>
                                            <div className="item-meta">
                                                <h4>{item.name}</h4>
                                                <p className="item-kitchen"><Store size={12} /> {item.isPass ? 'Membership' : (item.restaurant || 'Main Kitchen')}</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                     {!item.isPass && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const id = item._id || item.id;
                                                                toggleWishlist(id);
                                                                showToast(isInWishlist(id) ? 'Removed from wishlist' : 'Added to wishlist', 'success');
                                                            }}
                                                            className={`wishlist-cart-btn ${isInWishlist(item._id || item.id) ? 'active' : ''}`}
                                                            style={{
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                borderRadius: '12px',
                                                                color: isInWishlist(item._id || item.id) ? '#ff4b81' : 'rgba(255, 255, 255, 0.6)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                fontSize: '0.8rem',
                                                                padding: '0.5rem 1rem',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            <Heart size={18} fill={isInWishlist(item._id || item.id) ? '#ff4b81' : 'none'} />
                                                            {isInWishlist(item._id || item.id) ? 'SAVED' : 'WISHLIST'}
                                                        </button>
                                                     )}
                                                     <button 
                                                         onClick={() => removeFromCart(item._id || item.id)}
                                                         className="remove-link"
                                                     >
                                                         <Trash2 size={14} /> REMOVE
                                                     </button>
                                                 </div>
                                            </div>
                                            <div className="item-valuation">
                                                <div className={`unit-price ${isMostExpensive ? 'strikethrough' : ''}`} style={isMostExpensive ? {textDecoration: 'line-through', opacity: 0.5} : {}}>₹{item.price}</div>
                                                {isMostExpensive && <div className="reward-tag" style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 900 }}>SUBSCRIPTION FREE 🎁</div>}
                                                <div className="sub-total">₹{isMostExpensive ? (item.price * (item.quantity - 1)) : (item.price * item.quantity)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Right Side: Logistical Details */}
                <div className="logistics-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass" style={{ borderRadius: '32px', padding: '2rem' }}>
                        <h3 className="section-title"><MapPin size={20} /> Fulfillment Logistics</h3>
                        
                        <div className="delivery-grid-premium">
                            {DELIVERY_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setDeliveryType(type)}
                                    className={`delivery-type-chip ${deliveryType === type ? 'active' : ''}`}
                                >
                                    {type === 'Home' && <Home size={16} />}
                                    {type === 'Office' && <Briefcase size={16} />}
                                    {type === 'Other' && <Building size={16} />}
                                    {type === 'Hostel' && <Building size={16} />}
                                    {type === 'Gate' && <MapPin size={16} />}
                                    {type === 'Cafeteria' && <Store size={16} />}
                                    <span style={{ marginLeft: '0.5rem' }}>{type}</span>
                                </button>
                            ))}
                        </div>

                        {deliveryType === 'Office' && (
                            <div className="form-group-premium" style={{ marginTop: '1.5rem' }}>
                                <label>Office Name & Floor</label>
                                <input 
                                    type="text" 
                                    value={officeName}
                                    onChange={(e) => setOfficeName(e.target.value)}
                                    placeholder="Company Name, Floor/Block, etc."
                                />
                            </div>
                        )}

                        {deliveryType === 'Other' && (
                            <div className="form-group-premium" style={{ marginTop: '1.5rem' }}>
                                <label>Place Type & Details</label>
                                <input 
                                    type="text" 
                                    value={officeName}
                                    onChange={(e) => setOfficeName(e.target.value)}
                                    placeholder="e.g., Hostel, Hotel, Restaurant, etc."
                                />
                            </div>
                        )}

                        <div className="location-matrix">
                            <div className="form-group-premium">
                                <label>State Configuration</label>
                                <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedArea(''); }}>
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <div className="form-group-premium">
                                    <label>Terminal City</label>
                                    <select value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedArea(''); }}>
                                        <option value="">Select City</option>
                                        {STATE_CITY_MAP[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group-premium">
                                    <label>Access Zone</label>
                                    {(CITY_AREA_MAP[selectedCity] && CITY_AREA_MAP[selectedCity].length > 0) ? (
                                        <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                                            <option value="">Select Area</option>
                                            {CITY_AREA_MAP[selectedCity].map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    ) : (
                                        <input 
                                            type="text"
                                            value={selectedArea}
                                            onChange={(e) => setSelectedArea(e.target.value)}
                                            placeholder="Enter your area manually..."
                                            disabled={!selectedCity}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="form-group-premium" style={{ marginTop: '1.5rem' }}>
                                <label>Detailed Coordinates (Room/Flat/Office)</label>
                                <input 
                                    type="text" 
                                    value={addressDetails}
                                    onChange={(e) => setAddressDetails(e.target.value)}
                                    placeholder="Point of fulfillment details..."
                                />
                            </div>

                            <div className="form-group-premium" style={{ marginTop: '1.5rem' }}>
                                <label>Fulfillment Contact (Mobile)</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="90XXXXXXXX"
                                        style={{ paddingLeft: '45px' }}
                                    />
                                </div>
                            </div>

                            {/* Weekly Pass Section */}
                            <div className="glass" style={{ marginTop: '2rem', borderRadius: '20px', padding: '1.5rem', border: hasWeeklyPass ? '2px solid #10b981' : '1px solid rgba(59, 130, 246, 0.3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, color: hasWeeklyPass ? '#10b981' : '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Gift size={20} />
                                            Weekly Pass
                                        </h4>
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                            {hasWeeklyPass ? '✅ Active - Free item + No delivery charges' : 'Get 1 free item + No delivery charges for 7 days'}
                                        </p>
                                    </div>
                                    {!hasWeeklyPass && (
                                        <button 
                                            onClick={() => navigate('/passes')}
                                            className="btn btn-primary"
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '0.75rem 1.5rem',
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Buy Pass
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-premium settlement-box">
                        <h3 className="section-title">Financial Settlement</h3>
                        <div className="fee-structure">
                            <div className="fee-row">
                                <span>Item Valuation</span>
                                <span>₹{personalTotal}</span>
                            </div>
                            {isPassApplicable && (
                                <div className="fee-row pass-discount" style={{ color: '#10b981' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={14} /> Subscription Benefit: One Item FREE</div>
                                    <span>-₹{discountApplied}</span>
                                </div>
                            )}
                            {deliveryCharge > 0 && (
                                <div className="fee-row">
                                    <span>Delivery Charge</span>
                                    <span>₹{deliveryCharge.toFixed(2)}</span>
                                </div>
                            )}
                            {isPassApplicable && (
                                <div className="fee-row pass-discount" style={{ color: '#10b981' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={14} /> Free Delivery Applied</div>
                                    <span>-₹25.00</span>
                                </div>
                            )}
                            <div className="fee-row">
                                <span>Service & Tax (2.0%)</span>
                                <span>₹{Number(tax || 0).toFixed(2)}</span>
                            </div>
                            <div className="fee-row total">
                                <span>NET PAYABLE_</span>
                                <span>₹{Number(computedTotal || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary premium-checkout-btn" 
                            onClick={handleCheckout}
                        >
                            <ShieldCheck size={20} /> AUTHORIZE TRANSACTION
                        </button>
                        <p className="secure-tag"><Clock size={12} /> Priority delivery active for this order.</p>
                    </div>
                </div>
            </div>

            <CheckoutModal 
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                onConfirm={confirmCheckout}
                totalAmount={computedTotal}
            />

            {showPayment && currentOrder && (
                <div className="payment-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="payment-modal glass-premium"
                    >
                        <button className="close-payment" onClick={handlePaymentCancel}><X size={24}/></button>
                        <Payment 
                            order={currentOrder}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentCancel={handlePaymentCancel}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Cart;
