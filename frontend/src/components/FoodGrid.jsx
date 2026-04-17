import React, { useState } from 'react';
import { Heart, Plus, Star, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './FoodGrid.css';

const FoodGrid = ({ foods, loading }) => {
  const { addToCart, updateQuantity, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useFood();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAction = (action, data) => {
    if (!user) {
      navigate('/login');
      return;
    }
    action(data);
  };

  if (loading) {
    return (
      <div className="food-grid-loading">
        <div className="loading-spinner"></div>
        <p>Loading delicious food...</p>
      </div>
    );
  }

  if (!foods || foods.length === 0) {
    return (
      <div className="food-grid-empty">
        <h3>No food items available</h3>
        <p>Check back later for more options!</p>
      </div>
    );
  }

  return (
    <div className="food-grid">
      {foods.map((food, index) => {
        const isOutOfStock = (food.stock !== undefined && food.stock <= 0) || food.isAvailable === false;
        
        return (
          <div 
            key={food.id || food._id} 
            className={`food-card ${isOutOfStock ? 'out-of-stock' : ''}`} 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
          <div className="food-image-container" style={{ position: 'relative', overflow: 'hidden', height: '240px', borderRadius: '24px' }}>
            <img 
              src={food.image} 
              alt={food.name}
              className="food-image"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* Veg Indicator Tag (Top Left) */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, background: 'white', padding: '4px', borderRadius: '6px', display: 'flex' }}>
              <div className={food.category === 'nonveg' ? 'nonveg-indicator' : 'veg-indicator'} style={{ margin: 0 }}>
                <div className={food.category === 'nonveg' ? 'nonveg-dot' : 'veg-dot'}></div>
              </div>
            </div>

            {/* Price Tag (Top Right) */}
            <div style={{ 
              position: 'absolute', 
              top: '15px', 
              right: '15px', 
              zIndex: 10, 
              background: 'linear-gradient(135deg, #ff5a36 0%, #ff3108 100%)', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              fontWeight: '900',
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(255, 48, 8, 0.4)'
            }}>
              ₹{food.price}
            </div>

            {isOutOfStock && (
              <div className="sold-out-overlay">
                <span>SOLD OUT</span>
              </div>
            )}
          </div>
          
          <div className="food-content" style={{ padding: '1.5rem 0' }}>
            <div className="food-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 className="food-name" style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white', marginBottom: '0.25rem' }}>{food.name}</h3>
                {food.restaurant && (
                    <p className="food-restaurant" style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>{food.restaurant}</p>
                )}
              </div>
            </div>
            
            <div className="nutrition-tags" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {food.calories && (
                    <div className="nutrition-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        <Zap size={14} color="#ff5a36" /> {food.calories} kcal
                    </div>
                )}
                <div className="nutrition-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <Plus size={14} color="#ff5a36" /> 18g Protein
                </div>
            </div>

            <p className="food-description" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', lineHeight: '1.5', margin: 0 }}>{food.description}</p>
            
            {/* Quantity Control or Add to Cart */}
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', alignItems: 'center', marginTop: '1rem' }}>
              {cart.find(item => (item._id || item.id) === (food._id || food.id)) ? (
                <div className="quantity-control" style={{ flex: 1, margin: 0, height: '56px', borderRadius: '18px' }}>
                  <button className="qty-btn" onClick={() => updateQuantity(food._id || food.id, -1)}>
                    <Minus size={20} />
                  </button>
                  <span className="qty-value" style={{ fontSize: '1.2rem' }}>
                    {cart.find(item => (item._id || item.id) === (food._id || food.id)).quantity}
                  </span>
                  <button className="qty-btn" onClick={() => updateQuantity(food._id || food.id, 1)}>
                    <Plus size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
                  onClick={() => !isOutOfStock && handleAction(addToCart, food)}
                  disabled={isOutOfStock}
                  style={{ 
                    flex: 1, 
                    margin: 0, 
                    height: '56px', 
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #ff5a36 0%, #ff3108 100%)',
                    boxShadow: '0 8px 16px rgba(255, 48, 8, 0.2)'
                  }}
                >
                  {isOutOfStock ? (
                    <>Out of Stock</>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      ADD TO ORDER
                    </>
                  )}
                </button>
              )}
              
              <button 
                className={`wishlist-premium-btn ${isInWishlist(food.id || food._id) ? 'active' : ''}`}
                onClick={() => handleAction(toggleWishlist, food.id || food._id)}
                aria-label="Add to wishlist"
                style={{
                    background: isInWishlist(food.id || food._id) ? 'rgba(255, 90, 54, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isInWishlist(food.id || food._id) ? 'rgba(255, 90, 54, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '18px',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isInWishlist(food.id || food._id) ? '#ff5a36' : 'rgba(255, 255, 255, 0.6)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    backdropFilter: 'blur(10px)',
                    flexShrink: 0
                }}
              >
                <Heart 
                  size={24} 
                  fill={isInWishlist(food.id || food._id) ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
};

export default FoodGrid;
