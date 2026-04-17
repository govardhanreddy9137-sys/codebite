import React from 'react';
import { NavLink } from 'react-router-dom';
import { Utensils, ShoppingCart, History, Heart, Crown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './MobileNav.css';

const MobileNav = () => {
    const { cart } = useCart();
    const cartItemsCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item?.quantity || 1), 0) : 0;

    return (
        <div className="mobile-nav">
            <NavLink to="/menu" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Utensils size={24} />
                <span>Menu</span>
            </NavLink>
            <NavLink to="/wishlist" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Heart size={24} />
                <span>Wishlist</span>
            </NavLink>
            <NavLink to="/cart" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <div className="cart-icon-wrapper">
                    <ShoppingCart size={24} />
                    {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
                </div>
                <span>Cart</span>
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <History size={24} />
                <span>Orders</span>
            </NavLink>
            <NavLink to="/passes" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Crown size={24} />
                <span>Passes</span>
            </NavLink>
        </div>
    );
};

export default MobileNav;
