import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFood } from '../context/FoodContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    Utensils, Clock, CheckCircle, 
    TrendingUp, Store, ChevronRight, Activity, 
    DollarSign, Package, AlertCircle, Camera, Edit, Save, X,
    Users, Truck, ShoppingCart, Star, Filter, Search,
    Plus, Trash2, BarChart3, PieChart, CreditCard,
    MapPin, Phone, Mail, Settings, LogOut, Eye, Zap
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { uploadAPI } from '../api.js';
import './AdminDashboardNew.css';
import './AdminDashboardNewMenu.css';

const AdminDashboard = () => {
    const { foods, restaurants, polls, updateRestaurantStatus, addFood, updateFood, deleteFood } = useFood();
    const { orders } = useCart();
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    
    if (!Array.isArray(foods) || !Array.isArray(orders)) {
        return (
            <div className="admin-dashboard-loading">
                <div className="loader-bi" />
                <h2>Synchronizing Delta Collections...</h2>
                <p>Establishing secure connection to MongoDB Cluster</p>
                {(!Array.isArray(foods) || !Array.isArray(orders)) && (
                    <div className="diagnostic-badge">FAULT_DETECTED: API_SYNC_SYNC</div>
                )}
            </div>
        );
    }
    const [imageUrl, setImageUrl] = React.useState('');
    const [showImageEditor, setShowImageEditor] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('overview');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isUploading, setIsUploading] = React.useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = React.useState('all');
    const [editingItem, setEditingItem] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        price: '',
        description: '',
        image: '',
        restaurant: '',
        category: 'veg'
    });

    // Calculate statistics
    const pendingOrders = Array.isArray(orders) ? orders.filter(o => (o?.status || 'pending') === 'pending').length : 0;
    const preparingOrders = Array.isArray(orders) ? orders.filter(o => o?.status === 'preparing').length : 0;
    const readyOrders = Array.isArray(orders) ? orders.filter(o => o?.status === 'ready').length : 0;
    const deliveredOrders = Array.isArray(orders) ? orders.filter(o => o?.status === 'delivered').length : 0;
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order?.total || order?.amount || 0), 0) : 0;

    // Rider and Merchant revenue
    const riderRevenue = totalRevenue * 0.15; // 15% for riders
    const merchantRevenue = totalRevenue * 0.85; // 85% for merchants

    // Top items calculation
    const topItems = (() => {
        const counts = {};
        if (Array.isArray(orders)) {
            orders.forEach(o => {
                (o.items || []).forEach(item => {
                    const key = item.name || 'Unknown';
                    counts[key] = (counts[key] || 0) + (item.quantity || 1);
                });
            });
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    })();

    // Voting results
    const votingResults = (() => {
        const results = {};
        if (Array.isArray(polls)) {
            polls.forEach(poll => {
                if (poll.options) {
                    poll.options.forEach(option => {
                        results[option.text] = (results[option.text] || 0) + option.votes;
                    });
                }
            });
        }
        return Object.entries(results).sort((a, b) => b[1] - a[1]);
    })();

    const stats = [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#10b981', trend: '+12%' },
        { label: 'Pending Orders', value: pendingOrders, icon: <Clock size={20} />, color: '#f59e0b', trend: 'Active' },
        { label: 'Preparing Orders', value: preparingOrders, icon: <Activity size={20} />, color: '#3b82f6', trend: 'Cooking' },
        { label: 'Completed Orders', value: deliveredOrders, icon: <CheckCircle size={20} />, color: '#059669', trend: 'Done' }
    ];

    const revenueStats = [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#10b981' },
        { label: 'Merchant Revenue', value: `₹${merchantRevenue.toLocaleString()}`, icon: <Store size={20} />, color: '#3b82f6' },
        { label: 'Rider Revenue', value: `₹${riderRevenue.toLocaleString()}`, icon: <Truck size={20} />, color: '#f59e0b' },
        { label: 'Avg Order Value', value: `₹${(Array.isArray(orders) && orders.length > 0) ? Math.round(totalRevenue / orders.length) : 0}`, icon: <ShoppingCart size={20} />, color: '#8b5cf6' }
    ];

    const handleEditImage = (item, currentImage) => {
        setEditingImage(item);
        setImageUrl(currentImage);
        setShowImageEditor(true);
    };

    const handleSaveImage = () => {
        if (editingImage && imageUrl) {
            updateFood(editingImage.id, { image: imageUrl });
            alert(`Image updated for ${editingImage.name}`);
            setShowImageEditor(false);
            setEditingImage(null);
            setImageUrl('');
        }
    };

    const handleDuplicateItem = (item) => {
        const duplicatedItem = {
            ...item,
            id: Date.now().toString(),
            name: `${item.name} (Copy)`,
            _id: undefined
        };
        addFood(duplicatedItem);
        showToast('Item duplicated successfully!', 'success');
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('image', file);
        
        setIsUploading(true);
        try {
            const res = await uploadAPI.post(formDataFile);
            if (res.success) {
                // Update both local states depending on which modal is open
                setFormData(prev => ({ ...prev, image: res.imageUrl }));
                setImageUrl(res.imageUrl);
                showToast('Image uploaded successfully', 'success');
            } else {
                showToast(res.error || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Connection error during upload', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
            restaurant: item.restaurant,
            category: item.category || 'veg'
        });
    };

    const handleSaveItem = () => {
        if (editingItem) {
            updateFood(editingItem._id || editingItem.id, formData);
            showToast('Item updated successfully', 'success');
            setEditingItem(null);
            setFormData({
                name: '',
                price: '',
                description: '',
                image: '',
                restaurant: '',
                category: 'veg'
            });
        }
    };

    const handleAddItem = () => {
        if (!formData.name || !formData.price || !formData.restaurant) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        addFood(formData);
        showToast('New item deployed successfully', 'success');
        setFormData({
            name: '',
            price: '',
            description: '',
            image: '',
            restaurant: '',
            category: 'veg'
        });
    };

    const handleDeleteItem = (itemId) => {
        if (confirm('Are you sure you want to delete this item?')) {
            deleteFood(itemId);
        }
    };

    const filteredFoods = (Array.isArray(foods) ? foods : []).filter(f => 
        (selectedRestaurant === 'all' || f.restaurant === selectedRestaurant) &&
        (f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         f.restaurant?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="admin-header glass">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Admin Portal</h1>
                        <p>Complete Food Management System</p>
                    </div>
                    <div className="header-right">
                        <button className="btn btn-outline" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="admin-tabs glass">
                {['overview', 'revenue', 'menu', 'orders', 'voting', 'restaurants'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="tab-content">
                    <div className="stats-grid">
                        {stats.map((stat, idx) => (
                            <motion.div key={stat.label} className="stat-card glass" whileHover={{ y: -5 }}>
                                <div className="stat-icon" style={{ color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="stat-content">
                                    <h3>{stat.value}</h3>
                                    <p>{stat.label}</p>
                                    <span className="stat-trend">{stat.trend}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-card glass">
                            <h3>Recent Orders</h3>
                            <div className="orders-list">
                                {Array.isArray(orders) && orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="order-item">
                                        <div className="order-info">
                                            <span className="order-id">#{order.id?.slice(-6)}</span>
                                            <span className="order-status">{order.status}</span>
                                        </div>
                                        <span className="order-total">₹{order.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="dashboard-card glass">
                            <h3>Top Items</h3>
                            <div className="top-items-list">
                                {topItems.slice(0, 5).map(([name, count], idx) => (
                                    <div key={name} className="top-item">
                                        <span className="item-rank">#{idx + 1}</span>
                                        <span className="item-name">{name}</span>
                                        <span className="item-count">{count} orders</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
                <div className="tab-content">
                    <div className="stats-grid">
                        {revenueStats.map((stat, idx) => (
                            <motion.div key={stat.label} className="stat-card glass" whileHover={{ y: -5 }}>
                                <div className="stat-icon" style={{ color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="stat-content">
                                    <h3>{stat.value}</h3>
                                    <p>{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="dashboard-card glass">
                        <h3>Revenue Breakdown</h3>
                        <div className="revenue-chart">
                            <div className="revenue-bar">
                                <div className="bar-segment merchant" style={{ width: '85%' }}>
                                    <span>Merchant: 85%</span>
                                </div>
                                <div className="bar-segment rider" style={{ width: '15%' }}>
                                    <span>Rider: 15%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Management Tab */}
            {activeTab === 'menu' && (
                <div className="tab-content">
                    <div className="menu-management-header">
                        <div className="menu-header-left">
                            <h2>Menu Management</h2>
                            <p>Manage your restaurant menu items with ease</p>
                        </div>
                        <div className="menu-header-stats">
                            <div className="menu-stat">
                                <span className="stat-number">{filteredFoods.length}</span>
                                <span className="stat-label">Total Items</span>
                            </div>
                            <div className="menu-stat">
                                <span className="stat-number">{restaurants.length}</span>
                                <span className="stat-label">Restaurants</span>
                            </div>
                        </div>
                    </div>

                    <div className="menu-controls">
                        <div className="search-filters-row">
                            <div className="search-box-wrapper">
                                <Search size={20} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <select
                                value={selectedRestaurant}
                                onChange={(e) => setSelectedRestaurant(e.target.value)}
                                className="restaurant-filter"
                            >
                                <option value="all">All Restaurants</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                            <select className="category-filter">
                                <option value="all">All Categories</option>
                                <option value="veg">Vegetarian</option>
                                <option value="non-veg">Non-Vegetarian</option>
                                <option value="desserts">Desserts</option>
                                <option value="beverages">Beverages</option>
                            </select>
                        </div>
                        <div className="menu-actions">
                            <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '12px' }}>
                                <LogOut size={18} /> Sign Out
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowImageEditor(true)}>
                                <Camera size={18} />
                                Bulk Image Edit
                            </button>
                            <button className="btn btn-primary" onClick={() => setEditingItem({})}>
                                <Plus size={18} />
                                Add New Item
                            </button>
                        </div>
                    </div>

                    <div className="menu-grid-enhanced">
                        {filteredFoods.map((item, index) => (
                            <motion.div 
                                key={item.id} 
                                className="menu-item-card-enhanced glass"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                            >
                                <div className="item-image-container">
                                    <div className="item-image-wrapper">
                                        <img 
                                            src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'} 
                                            alt={item.name}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                                            }}
                                        />
                                        <div className="image-overlay">
                                            <button 
                                                className="image-edit-btn"
                                                onClick={() => handleEditImage(item, item.image)}
                                            >
                                                <Camera size={16} />
                                            </button>
                                            <button 
                                                className="image-preview-btn"
                                                onClick={() => window.open(item.image, '_blank')}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="item-category-badge">
                                        <span>{item.category || 'veg'}</span>
                                    </div>
                                </div>
                                
                                <div className="item-content">
                                    <div className="item-header">
                                        <h4 className="item-name">{item.name}</h4>
                                        <div className="item-price-tag">₹{item.price}</div>
                                    </div>
                                    
                                    <p className="item-description">
                                        {item.description || 'Delicious food item from our menu'}
                                    </p>
                                    
                                    <div className="item-meta">
                                        <div className="item-restaurant">
                                            <Store size={14} />
                                            <span>{item.restaurant}</span>
                                        </div>
                                        <div className="item-rating">
                                            <Star size={14} className="star-icon" />
                                            <span>4.5</span>
                                        </div>
                                    </div>
                                    
                                    <div className="item-stats">
                                        <span className="stat-item">
                                            <span className="stat-value">{Math.floor(Math.random() * 100) + 20}</span>
                                            <span className="stat-text">orders</span>
                                        </span>
                                        <span className="stat-item">
                                            <span className="stat-value">{Math.floor(Math.random() * 50) + 10}</span>
                                            <span className="stat-text">reviews</span>
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="item-actions">
                                    <button 
                                        className="action-btn edit-btn"
                                        onClick={() => handleEditItem(item)}
                                        title="Edit Item"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        className="action-btn duplicate-btn"
                                        onClick={() => handleDuplicateItem(item)}
                                        title="Duplicate Item"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button 
                                        className="action-btn delete-btn"
                                        onClick={() => handleDeleteItem(item.id)}
                                        title="Delete Item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredFoods.length === 0 && (
                        <div className="empty-menu-state">
                            <div className="empty-icon">
                                <Utensils size={48} />
                            </div>
                            <h3>No menu items found</h3>
                            <p>Try adjusting your search or filters, or add a new item to get started.</p>
                            <button className="btn btn-primary" onClick={() => setEditingItem({})}>
                                <Plus size={18} />
                                Add First Item
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="tab-content">
                    <div className="orders-table-container glass">
                        <h3>All Orders</h3>
                        <div className="orders-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(orders) && orders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id?.slice(-6)}</td>
                                            <td>{order.customerName || 'Guest'}</td>
                                            <td>{order.items?.length || 0} items</td>
                                            <td>₹{order.total}</td>
                                            <td>
                                                <span className={`status-badge ${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Voting Tab */}
            {activeTab === 'voting' && (
                <div className="tab-content">
                    <div className="voting-results glass">
                        <h3>Voting Results</h3>
                        <div className="voting-list">
                            {votingResults.map(([item, votes], idx) => (
                                <div key={item} className="voting-item">
                                    <div className="voting-rank">#{idx + 1}</div>
                                    <div className="voting-info">
                                        <h4>{item}</h4>
                                        <div className="voting-bar">
                                            <div 
                                                className="voting-progress" 
                                                style={{ width: `${(votes / Math.max(...votingResults.map(v => v[1]))) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="voting-votes">{votes} votes</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
                <div className="tab-content">
                    <div className="restaurants-grid">
                        {restaurants.map(restaurant => (
                            <div key={restaurant.id} className="restaurant-card glass">
                                <div className="restaurant-image">
                                    <img 
                                        src={restaurant.image} 
                                        alt={restaurant.name} 
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                                        }}
                                    />
                                </div>
                                <div className="restaurant-info">
                                    <h4>{restaurant.name}</h4>
                                    <p>{restaurant.cuisine}</p>
                                    <div className="restaurant-status">
                                        <span className={`status-indicator ${restaurant.isOpen ? 'open' : 'closed'}`}>
                                            {restaurant.isOpen ? 'Open' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                                <div className="restaurant-actions">
                                    <button 
                                        className={`btn btn-sm ${restaurant.isOpen ? 'btn-danger' : 'btn-success'}`}
                                        onClick={() => updateRestaurantStatus(restaurant.id, !restaurant.isOpen)}
                                    >
                                        {restaurant.isOpen ? 'Close' : 'Open'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit/Add Item Modal */}
            {editingItem && (
                <div className="modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="modal-content glass-premium"
                        style={{ maxWidth: '800px', width: '95%', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}
                    >
                        <div className="modal-main-form">
                            <div className="modal-header">
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingItem.id || editingItem._id ? 'RECONCILE_ASSET' : 'DEPLOY_NEW_ASSET'}</h2>
                                <button className="close-btn" onClick={() => setEditingItem(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="modal-body-grid">
                                <div className="form-group-bi">
                                    <label>ASSET_NAME</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dish name..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="form-group-bi">
                                    <label>CREDIT_VAL (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                <div className="form-group-bi" style={{ gridColumn: 'span 2' }}>
                                    <label>ASSET_IMAGE_URL</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="https://images.unsplash.com/..."
                                            value={formData.image}
                                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                                            style={{ flex: 1 }}
                                        />
                                        <input 
                                            type="file" 
                                            id="file-upload-dash" 
                                            hidden 
                                            onChange={handleImageUpload} 
                                            accept="image/*"
                                        />
                                        <label htmlFor="file-upload-dash" className="btn-bi-primary" style={{ cursor: 'pointer', padding: '0.8rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                            {isUploading ? <Zap size={16} className="animate-spin" /> : <Camera size={16} />}
                                            BROWSE
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group-bi">
                                    <label>VENDOR_NODE</label>
                                    <select
                                        value={formData.restaurant}
                                        onChange={(e) => setFormData({...formData, restaurant: e.target.value})}
                                    >
                                        <option value="">SELECT_NODE</option>
                                        {restaurants.map(r => (
                                            <option key={r.id} value={r.name}>{r.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group-bi">
                                    <label>CATEGORY</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="veg">VEGETARIAN</option>
                                        <option value="nonveg">NON-VEG</option>
                                        <option value="drinks">DRINKS</option>
                                        <option value="shakes">SHAKES</option>
                                        <option value="tea">TEA</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer-bi">
                                <button className="btn-bi-secondary" onClick={() => setEditingItem(null)}>ABORT</button>
                                <button 
                                    className="btn-bi-primary" 
                                    onClick={() => {
                                        if (editingItem.id || editingItem._id) handleSaveItem();
                                        else handleAddItem();
                                        setEditingItem(null);
                                    }}
                                >
                                    {editingItem.id || editingItem._id ? 'COMMIT_CHANGES' : 'INITIALIZE_DEPLOYMENT'}
                                </button>
                            </div>
                        </div>

                        {/* Live Preview Console */}
                        <div className="preview-console glass">
                            <h4 style={{ fontSize: '0.7rem', color: 'var(--primary)', letterSpacing: '2px', marginBottom: '1.5rem' }}>LIVE_PREVIEW</h4>
                            <div className="preview-card-mini">
                                <div className="preview-img-box">
                                    <img src={formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'} alt="preview" />
                                    <div className="preview-price">₹{formData.price || '0'}</div>
                                </div>
                                <div className="preview-info">
                                    <h5>{formData.name || 'NEW_ASSET'}</h5>
                                    <p>{formData.restaurant || 'NO_VENDOR_SELECTED'}</p>
                                    <div className="preview-badge">{formData.category.toUpperCase()}</div>
                                </div>
                            </div>
                            <div className="system-logs">
                                <div>[OK] ASSET_PIPE_ACTIVE</div>
                                <div>[OK] RENDER_CORE_STABLE</div>
                                {formData.image && <div>[OK] IMG_SOURCE_RESOLVED</div>}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Image Editor Modal */}
            {showImageEditor && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h3>Edit Image</h3>
                            <button className="close-btn" onClick={() => setShowImageEditor(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Image URL</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="Enter image URL"
                                        style={{ flex: 1 }}
                                    />
                                    <input 
                                        type="file" 
                                        id="file-upload-edit" 
                                        hidden 
                                        onChange={handleImageUpload} 
                                        accept="image/*"
                                    />
                                    <label htmlFor="file-upload-edit" className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Camera size={16} /> Choose File
                                    </label>
                                </div>
                            </div>
                            {imageUrl && (
                                <div className="image-preview">
                                    <img src={imageUrl} alt="Preview" />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowImageEditor(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveImage}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
