import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFood } from '../context/FoodContext';
import { 
    Utensils, ShoppingCart, LogOut, LayoutDashboard, History, 
    Menu as MenuIcon, Users, Calendar, ThumbsUp, Heart, 
    Navigation, Crown, Zap, MessageCircle 
} from 'lucide-react';
import './Navbar.css'; 

const Navbar = () => {
    const { user, logout, auraRank } = useAuth();
    const { cart, orders } = useCart();
    const { wishlist, polls } = useFood();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSwitchRole = () => {
        navigate('/login');
    };

    const handleWhatsAppClick = () => {
        const phoneNumber = '9023865544';
        const message = encodeURIComponent('Hello! I need help with my food order.');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const cartItemsCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item?.quantity || 1), 0) : 0;

    return (
        <nav className="navbar glass">
            <div className="navbar-container container">
                <Link to="/" className="navbar-logo">
                    <div className="logo-accent"></div>
                    <span>Code<span className="logo-highlight">Bite</span></span>
                </Link>

                <div className="navbar-links">
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <>
                                    <Link to="/admin" className="nav-link">
                                        <LayoutDashboard size={20} />
                                        Dashboard
                                    </Link>
                                    <a href="/" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                        <Zap size={18} /> View Live Site
                                    </a>
                                    <Link to="/admin/food" className="nav-link">Menu Manager</Link>
                                    <Link to="/admin/orders" className="nav-link">
                                        Orders
                                        {Array.isArray(orders) && orders.filter(o => o?.status === 'pending').length > 0 && (
                                            <span className="cart-badge admin-badge">
                                                {orders.filter(o => o?.status === 'pending').length}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            ) : user.role === 'merchant' ? (
                                <>
                                    <Link to="/merchant/dashboard" className="nav-link">
                                        <LayoutDashboard size={20} />
                                        Store
                                    </Link>
                                </>
                            ) : user.role === 'rider' ? (
                                <>
                                    <Link to="/rider/dashboard" className="nav-link">
                                        <Navigation size={20} />
                                        Rider Portal
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/menu" className="nav-link">
                                        <MenuIcon size={20} />
                                        Menu
                                    </Link>
                                    <Link to="/passes" className="nav-link" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                                        <Crown size={20} />
                                        Passes
                                    </Link>
                                    <Link to="/orders" className="nav-link">
                                        <History size={20} />
                                        Orders
                                    </Link>
                                    <Link to="/wishlist" className="nav-link nav-link-wishlist">
                                        <Heart size={20} />
                                        Wishlist
                                        {Array.isArray(wishlist) && wishlist.length > 0 && (
                                            <span className="cart-badge badge-wishlist">{wishlist.length}</span>
                                        )}
                                    </Link>
                                    <Link to="/vote" className="nav-link nav-link-voting">
                                        <ThumbsUp size={20} />
                                        Votes
                                        {Array.isArray(polls) && (
                                            <span className="cart-badge badge-voting">{polls.length}</span>
                                        )}
                                    </Link>
                                    <Link to="/cart" className="nav-link cart-link">
                                        <ShoppingCart size={20} />
                                        Cart
                                        {cartItemsCount > 0 && (
                                            <span className="cart-badge">{cartItemsCount}</span>
                                        )}
                                    </Link>
                                </>
                            )}
                            <div className="user-profile-premium">
                                <Link to="/wishlist" className="profile-wishlist-shortcut" title="My Wishlist">
                                    <Heart size={18} />
                                    {wishlist.length > 0 && <span className="mini-badge">{wishlist.length}</span>}
                                </Link>
                                <div className="user-details-box">
                                    <span className="user-name-premium">{user?.name?.split(' ')[0]}</span>
                                    <span className="user-role-premium">{user?.role}</span>
                                </div>
                                <button onClick={handleLogout} className="logout-icon-btn" title="Sign Out">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link to="/login" className="btn btn-primary">Login</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
