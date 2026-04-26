import React, { useMemo } from 'react';
import { useFood } from '../context/FoodContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Menu.css';

const Wishlist = () => {
    const { foods, wishlist, toggleWishlist } = useFood();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const wishlistFoods = useMemo(() => {
        if (!Array.isArray(wishlist)) return [];
        const wishlistIds = new Set(wishlist.map(item => 
            typeof item === 'object' ? (item._id || item.id) : item
        ));
        return foods.filter(f => wishlistIds.has(f._id || f.id));
    }, [foods, wishlist]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <motion.div 
            className="container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div className="menu-header" variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <div>
                    <motion.h1 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        Your Favorites <Sparkles size={32} color="var(--primary)" />
                    </motion.h1>
                    <p>A curated collection of your most-loved dishes.</p>
                </div>
                {wishlistFoods.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-primary"
                        onClick={() => {
                            wishlistFoods.forEach(f => addToCart(f));
                            showToast('All favorites moved to cart!', 'success');
                        }}
                        style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                        <ShoppingCart size={20} /> QUICK_ADD_ALL
                    </motion.button>
                )}
            </motion.div>

            <AnimatePresence mode="popLayout">
                {wishlistFoods.length === 0 ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-premium" 
                        style={{ padding: '5rem 2rem', borderRadius: '40px', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}
                    >
                        <Heart size={64} color="var(--text-secondary)" style={{ marginBottom: '2rem', opacity: 0.3 }} />
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Your wishlist is craving attention</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Save your favorite dishes here to order them with a single tap later.</p>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/menu')}
                            style={{ padding: '1rem 2rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto' }}
                        >
                            Browse Menu <ArrowRight size={20} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div className="menu-grid" variants={containerVariants} layout>
                        {wishlistFoods.map((food) => (
                            <motion.div
                                key={food.id || food._id}
                                layout
                                variants={itemVariants}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                className="food-card glass-premium"
                            >
                                <div className="food-image-wrapper">
                                    <img src={food.image} alt={food.name} className="food-image" />
                                    <div className="food-price">₹{food.price}</div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="button"
                                        onClick={() => toggleWishlist(food.id || food._id)}
                                        className="wishlist-btn-premium"
                                        style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}
                                    >
                                        <Heart size={20} fill="var(--primary)" color="var(--primary)" />
                                    </motion.button>
                                </div>
                                <div className="food-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3>{food.name}</h3>
                                        <span className={`role-badge ${food.category}`}>
                                            {food.category === 'nonveg' ? '🥩' : '🌿'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                        {food.description}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn btn-primary add-to-cart-btn"
                                        onClick={() => addToCart(food)}
                                        style={{ width: '100%', marginTop: '1rem', display: 'flex', gap: '0.75rem' }}
                                    >
                                        <ShoppingCart size={20} /> Move to Order
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Wishlist;
