import React, { useEffect, useMemo, useState } from 'react';
import { useFood } from '../context/FoodContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Minus, Store, Star, Sparkles, X, ShoppingCart, Filter, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import HighestVotedItems from '../components/HighestVotedItems';
import './Menu.css';

const Menu = () => {
    const { foods, restaurants: restaurantStatuses, toggleWishlist, isInWishlist, loading } = useFood();
    const { addToCart, cart, updateQuantity } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');

    const filteredFoods = useMemo(() => {
        if (!foods) return [];
        return foods.filter(f => {
            const matchesRestaurant = selectedRestaurant ? (f.restaurant === selectedRestaurant) : true;
            const q = selectedCategory?.toLowerCase();
            const matchesCategory = selectedCategory === 'all' ? true : 
                (q === 'shakes' || q === 'drinks') ? 
                (['drinks', 'shakes', 'tea'].includes(f.category?.toLowerCase()) || 
                 ['shake', 'tea', 'coffee', 'milk', 'juice', 'lassi'].some(keyword => f.name?.toLowerCase().includes(keyword))) :
                (f.category && f.category.toLowerCase() === q);
            return matchesRestaurant && matchesCategory;
        });
    }, [foods, selectedRestaurant, selectedCategory]);

    const displayedFoods = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        let result = q ? filteredFoods.filter(f => (f.name || '').toLowerCase().includes(q)) : filteredFoods;
        if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
        else if (sortBy === 'calories') result = [...result].sort((a, b) => (a.calories || 0) - (b.calories || 0));
        return result;
    }, [filteredFoods, searchTerm, sortBy]);

    const handleSurpriseMe = () => {
        if (filteredFoods.length === 0) return;
        const randomFood = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
        addToCart(randomFood);
        showToast(`Surprise! Added ${randomFood.name} to your cart.`, 'success');
        navigate('/cart');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    if (loading) return <div className="loading-state">Loading Selection...</div>;

    return (
        <motion.div 
            className="menu-page-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Floating Cart Indicator */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 100 }}
                        className="floating-cart-badge"
                        onClick={() => navigate('/cart')}
                        style={{
                            position: 'fixed',
                            bottom: '2rem',
                            right: '2rem',
                            zIndex: 1000,
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            boxShadow: '0 10px 30px rgba(255, 90, 54, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 800,
                            border: '2px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <ShoppingCart size={24} />
                        <span>{cart.reduce((s, i) => s + i.quantity, 0)} ITEMS</span>
                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />
                        <span>₹{cart.reduce((s, i) => s + (i.price * i.quantity), 0)}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Hero Section */}
            <motion.div className="menu-hero glass" variants={itemVariants}>
                <div className="hero-content">
                    <div className="hero-badge">
                        <Sparkles size={14} /> Chef's Daily Discovery
                    </div>
                    <h1>The Culinary <span className="text-primary">Chronicle</span></h1>
                    <p>Experience gourmet excellence delivered to your professional workspace. Every dish is a story of craft and flavor.</p>
                    
                    <div className="hero-search">
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by dish or kitchen..."
                        />
                        <button className="search-submit-btn">
                            <Search size={20} />
                        </button>
                        {searchTerm && (
                            <button className="clear-btn" onClick={() => setSearchTerm('')} style={{ marginRight: '0.5rem' }}>
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="abstract-glow"></div>
                </div>
            </motion.div>

            <div className="container">
                <div className="filters-bar glass">
                    <div className="category-tabs">
                        {['All', 'Veg', 'Nonveg', 'Tiffens', 'Drinks'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat.toLowerCase() === 'drinks' ? 'shakes' : cat.toLowerCase())}
                                className={`tab-btn ${(selectedCategory === cat.toLowerCase() || (selectedCategory === 'shakes' && cat.toLowerCase() === 'drinks')) ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    
                    <div className="sort-dropdown">
                        <Filter size={18} />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="default">Best Match</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="calories">Leanest First</option>
                        </select>
                    </div>
                </div>

                <motion.div 
                    className="surprise-banner"
                    whileHover={{ scale: 1.01 }}
                    style={{
                        marginBottom: '4rem',
                        background: 'linear-gradient(135deg, rgba(255,90,54,0.1) 0%, rgba(10,10,11,0.8) 100%)',
                        border: '1px solid rgba(255,90,54,0.2)',
                        borderRadius: '24px',
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1.5rem'
                    }}
                >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Sparkles size={32} color="var(--primary)" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Busy Day? "Surprise Me!"</h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>1-Click to get today's highly-rated meal instantly added to cart.</p>
                        </div>
                    </div>
                    <button onClick={handleSurpriseMe} className="btn btn-primary">
                        Surprise Me!
                    </button>
                </motion.div>
                
                <HighestVotedItems />

                <motion.div className="restaurant-section" variants={itemVariants} style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Store size={32} color="var(--primary)" />
                        {selectedRestaurant ? `Menu from ${selectedRestaurant}` : 'Premium Kitchens'}
                    </h2>
                    <div className="restaurant-scroll-container">
                        {Array.isArray(restaurantStatuses) && restaurantStatuses.map((rInfo) => (
                            <motion.div
                                key={rInfo.name}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className={`restaurant-visual-card ${selectedRestaurant === rInfo.name ? 'active' : ''} ${!rInfo.isOpen ? 'is-closed' : ''}`}
                                onClick={() => setSelectedRestaurant(rInfo.name)}
                            >
                                <div className="rest-image-wrapper">
                                    <img src={rInfo.image?.startsWith('http') || rInfo.image?.startsWith('/') ? rInfo.image : `/${rInfo.image}`} alt={rInfo.name} />
                                    <div className="rest-overlay"></div>
                                    {!rInfo.isOpen && <div className="closed-tag-overlay">CLOSED</div>}
                                    {rInfo.offer && <div className="rest-offer-tag">{rInfo.offer}</div>}
                                    <div className="rest-rating-float">
                                        <Star size={14} fill="currentColor" /> {rInfo.rating || '4.0'}
                                    </div>
                                </div>
                                <div className="rest-info">
                                    <h3>{rInfo.name}</h3>
                                    <p className="rest-cuisine">{rInfo.cuisine || 'Fine Dining • Healthy'}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="menu-grid" variants={containerVariants}>
                    <AnimatePresence mode="popLayout">
                        {displayedFoods.length === 0 ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="card-basic" 
                                style={{ padding: '4rem', borderRadius: '32px', gridColumn: '1 / -1', textAlign: 'center' }}
                            >
                                <Sparkles size={48} color="var(--text-secondary)" style={{ marginBottom: '1.5rem' }} />
                                <h3 style={{ color: 'white' }}>No dishes found match your search</h3>
                                <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>Clear Filters</button>
                            </motion.div>
                        ) : (
                            displayedFoods.map((food, index) => (
                                <motion.div
                                    key={food._id || food.id || `food-${index}`}
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="food-card"
                                >
                                    <div className="food-image-wrapper">
                                        <div className="veg-indicator-corner">
                                            <div className={food.category === 'nonveg' ? 'nonveg-indicator' : 'veg-indicator'}>
                                                <div className={food.category === 'nonveg' ? 'nonveg-dot' : 'veg-dot'}></div>
                                            </div>
                                        </div>
                                        
                                        <img 
                                            src={food.image?.startsWith('http') || food.image?.startsWith('/') ? food.image : `/${food.image}`} 
                                            alt={food.name} 
                                            className="food-image"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                                            }}
                                        />
                                        <div className="food-price">₹{food.price}</div>
                                        <button
                                            type="button"
                                            onClick={() => toggleWishlist(food.id || food._id)}
                                            className="wishlist-btn-premium"
                                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
                                        >
                                            <Heart size={20} fill={isInWishlist(food.id || food._id) ? "var(--primary)" : "transparent"} color={isInWishlist(food.id || food._id) ? "var(--primary)" : "white"} />
                                        </button>
                                    </div>
                                    <div className="food-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3>{food.name}</h3>
                                            {food.restaurant && <p className="food-restaurant" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{food.restaurant}</p>}
                                        </div>
                                        <div className="nutrition-tags">
                                            <span className="nutrition-tag">🔥 {food.calories || 250} kcal</span>
                                            <span className="nutrition-tag">🥩 {food.protein || 12}g Protein</span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{food.description}</p>
                                        
                                        {cart.find(item => (item._id || item.id) === (food._id || food.id)) ? (
                                            <div className="quantity-control">
                                                <button className="qty-btn" onClick={() => updateQuantity((food._id || food.id), -1)}>-</button>
                                                <span className="qty-value">{cart.find(item => (item._id || item.id) === (food._id || food.id))?.quantity || 0}</span>
                                                <button className="qty-btn" onClick={() => updateQuantity((food._id || food.id), 1)}>+</button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-primary add-to-cart-btn" onClick={() => addToCart(food)}>
                                                <ShoppingCart size={20} /> Add to Order
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

                <HighestVotedItems />
            </div>
        </motion.div>
    );
};

export default Menu;
