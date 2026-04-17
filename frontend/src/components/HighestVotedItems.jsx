import React, { useState, useEffect } from 'react';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { 
    TrendingUp, Star, Clock, MapPin, DollarSign, 
    ShoppingCart, Heart, Trophy, Award, Flame
} from 'lucide-react';
import './HighestVotedItems.css';

const HighestVotedItems = () => {
    const { getHighestVotedItems, promoteHighestVotedToMenu, foods } = useFood();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [highestVoted, setHighestVoted] = useState([]);
    const [showPromoteButton, setShowPromoteButton] = useState(false);

    useEffect(() => {
        const items = getHighestVotedItems();
        setHighestVoted(items);
        
        // Show promote button if user is admin and there are items with enough votes
        if (user?.role === 'admin') {
            const eligibleItems = items.filter(item => item.votes >= 3);
            setShowPromoteButton(eligibleItems.length > 0);
        }
    }, [getHighestVotedItems, user]);

    const handlePromoteToMenu = () => {
        const promotedCount = promoteHighestVotedToMenu();
        alert(`Successfully promoted ${promotedCount} items to the main menu!`);
        setShowPromoteButton(false);
    };

    const handleAddToCart = (item) => {
        const foodItem = {
            id: item.id || item._id,
            name: item.name,
            price: item.price || 150,
            image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            restaurant: item.restaurant || 'Popular Choice',
            description: item.description || `Highly voted item with ${item.votes} votes`
        };
        addToCart(foodItem);
    };

    if (highestVoted.length === 0) {
        return (
            <div className="highest-voted-empty">
                <Trophy size={48} />
                <h3>No voted items yet</h3>
                <p>Start voting to see popular choices here!</p>
            </div>
        );
    }

    return (
        <div className="highest-voted-container">
            <div className="highest-voted-header">
                <div className="header-left">
                    <div className="header-icon">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h2>🔥 Highest Voted Items</h2>
                        <p>Most popular choices from our community</p>
                    </div>
                </div>
                {showPromoteButton && (
                    <button 
                        className="promote-btn btn btn-primary"
                        onClick={handlePromoteToMenu}
                    >
                        <TrendingUp size={18} />
                        Promote to Menu
                    </button>
                )}
            </div>

            <div className="highest-voted-grid">
                {highestVoted.map((item, index) => (
                    <motion.div
                        key={item.id || item.text}
                        className="voted-item-card glass"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="item-rank">
                            {index === 0 && <Trophy size={20} color="#FFD700" />}
                            {index === 1 && <Award size={20} color="#C0C0C0" />}
                            {index === 2 && <Award size={20} color="#CD7F32" />}
                            {index > 2 && <span>#{index + 1}</span>}
                        </div>

                        <div className="item-image">
                            <img src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80'} alt={item.name} />
                            <div className="vote-badge">
                                <Star size={16} />
                                {item.votes || 0}
                            </div>
                        </div>

                        <div className="item-content">
                            <h3>{item.name}</h3>
                            <p className="item-description">
                                {item.description || `Popular choice with ${item.votes} votes`}
                            </p>
                            <div className="item-meta">
                                <span className="item-price">₹{item.price || 150}</span>
                                <span className="item-restaurant">
                                    <MapPin size={14} />
                                    {item.restaurant || 'Popular Choice'}
                                </span>
                            </div>
                        </div>

                        <div className="item-actions">
                            <button 
                                className="add-to-cart-btn btn btn-primary btn-sm"
                                onClick={() => handleAddToCart(item)}
                            >
                                <ShoppingCart size={16} />
                                Add
                            </button>
                        </div>

                        {item.votes >= 5 && (
                            <div className="popular-badge">
                                <Flame size={12} />
                                Hot!
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="voting-stats">
                <div className="stat-item">
                    <div className="stat-value">{highestVoted.length}</div>
                    <div className="stat-label">Total Items</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">
                        {highestVoted.reduce((sum, item) => sum + (item.votes || 0), 0)}
                    </div>
                    <div className="stat-label">Total Votes</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">
                        {highestVoted.filter(item => item.votes >= 5).length}
                    </div>
                    <div className="stat-label">Hot Items</div>
                </div>
            </div>
        </div>
    );
};

export default HighestVotedItems;
