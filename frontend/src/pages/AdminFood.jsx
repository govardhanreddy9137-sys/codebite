// Refresh: 2026-04-11T15:35:00
import React, { useState, useEffect } from 'react';
import { useFood } from '../context/FoodContext';
import { uploadAPI } from '../api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Upload, Image as ImageIcon, Search, Filter, Store, Package, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './AdminFood.css';

const AdminFood = () => {
    const { foods, addFood, updateFood, deleteFood, polls, promoteToMenu, updatePoll, deletePoll, restaurants, updateRestaurantStatus } = useFood();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isAdding, setIsAdding] = React.useState(false);
    const [selectedFilterRestaurant, setSelectedFilterRestaurant] = React.useState('all');
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [activeTab, setActiveTab] = React.useState('inventory'); // 'inventory', 'polls', 'ops'

    const [isLoading, setIsLoading] = React.useState(false);
    const [editingId, setEditingId] = React.useState(null);
    const [editingType, setEditingType] = React.useState('food'); // 'food' or 'poll'
    const [formData, setFormData] = React.useState({
        name: '', price: '', description: '', image: '', restaurant: '', stock: 50, isAvailable: true, category: 'tiffins'
    });

    const filteredFoods = (foods || []).filter(f =>
        f && (selectedFilterRestaurant === 'all' || f.restaurant === selectedFilterRestaurant) &&
        (selectedCategory === 'all' || f.category?.toLowerCase() === selectedCategory) &&
        ((f.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
         (f.restaurant || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const resetForm = () => {
        setFormData({ 
            name: '', 
            price: '', 
            description: '', 
            image: '', 
            restaurant: '', 
            stock: 50, 
            isAvailable: true, 
            category: 'tiffins',
            calories: 0,
            protein: 0
        });
        setIsAdding(false);
        setEditingId(null);
        setEditingType('food');
        setIsLoading(false);
    };

    const startEdit = (food) => {
        setFormData({
            name: food.name || '',
            price: food.price || '',
            description: food.description || '',
            image: food.image || '',
            restaurant: food.restaurant || '',
            stock: food.stock !== undefined ? food.stock : 50,
            isAvailable: food.isAvailable !== undefined ? food.isAvailable : true,
            category: food.category || 'tiffins',
            calories: food.calories || 0,
            protein: food.protein || 0
        });
        setEditingId(food._id || food.id);
        setIsAdding(true);
        window.scrollTo(0, 0);
    };

    const startEditPoll = (poll) => {
        setFormData({
            name: poll.name || '',
            price: poll.price || '',
            description: poll.description || '',
            image: poll.image || '',
            restaurant: '',
            stock: 50,
            isAvailable: true,
            category: 'tiffins',
            calories: 0,
            protein: 0
        });
        setEditingId(poll._id || poll.id);
        setEditingType('poll');
        setIsAdding(true);
        window.scrollTo(0, 0);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        
        setIsLoading(true);
        try {
            const res = await uploadAPI.post(formData);
            if (res.success) {
                setFormData({ ...formData, image: res.imageUrl });
                showToast('Image uploaded successfully', 'success');
            } else {
                showToast(res.error || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Connection error during upload', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const data = { 
            ...formData, 
            price: parseFloat(formData.price) || 0,
            stock: parseInt(formData.stock) || 50,
            calories: parseInt(formData.calories) || 0,
            protein: parseInt(formData.protein) || 0
        };
        
        try {
            if (editingId) {
                if (editingType === 'poll') {
                    // Update poll
                    const pollData = {
                        name: data.name,
                        price: data.price,
                        description: data.description,
                        image: data.image
                    };
                    await updatePoll(editingId, pollData);
                    showToast('Poll updated successfully', 'success');
                } else {
                    // Update food
                    await updateFood(editingId, data);
                    showToast('Item updated successfully', 'success');
                }
            } else {
                await addFood(data);
                showToast('New item added successfully', 'success');
            }
            resetForm();
        } catch (err) {
            console.error('Error saving:', err);
            showToast(err.message || 'Failed to save', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePoll = async (id, name) => {
        if (!confirm(`Are you sure you want to delete poll "${name}"?`)) return;
        
        try {
            await deletePoll(id);
            showToast('Poll deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting poll:', err);
            showToast('Failed to delete poll', 'error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="admin-container container">
            <div className="splash-grid-overlay" style={{ opacity: 0.1 }} />
            
            <div className="bi-header-compact glass-premium">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '0.25rem' }}>Catalogue Control</h1>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>GOURMET_INVENTORY • ASSET_MANAGEMENT</p>
                </div>
                <div className="bi-meta-controls">
                    <button className="bi-action-btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={20} /> DEPLOY_NEW_ITEM
                    </button>
                </div>
            </div>

            <div className="bi-tab-navigation">
                {['inventory', 'polls', 'ops'].map(tab => (
                    <button 
                        key={tab}
                        className={`bi-nav-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'ops' && (
                    <motion.div 
                        key="ops"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bi-ops-section glass-premium"
                    >
                        <h3 className="bi-sub-header"><Store size={20} /> NETWORK_NODES</h3>
                        <div className="bi-ops-grid">
                            {restaurants.map(r => (
                                <div key={r._id || r.id} className={`ops-node-card glass-premium ${!r.isOpen ? 'offline' : ''}`}>
                                    <div className="ops-node-header">
                                        <h4>{r.name?.toUpperCase()}</h4>
                                        <div className={`status-signal ${r.isOpen ? 'online' : 'offline'}`} />
                                    </div>
                                    <div className="ops-node-meta">
                                        <span>STATUS: {r.isOpen ? 'ACTIVE_BROADCAST' : 'SIGNAL_TERMINATED'}</span>
                                        <button 
                                            className={`ops-toggle-btn ${r.isOpen ? 'shutdown' : 'reboot'}`}
                                            onClick={() => updateRestaurantStatus(r._id || r.id, { isOpen: !r.isOpen })}
                                        >
                                            {r.isOpen ? 'INIT_SHUTDOWN' : 'INIT_REBOOT'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'inventory' && (
                    <motion.div 
                        key="inventory"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bi-search-cluster glass-premium">
                            <input 
                                type="text" 
                                placeholder="FILTER_CATALOGUE_BY_NAME_OR_VENDOR..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button 
                                className="bi-action-btn-primary" 
                                onClick={() => showToast('Search active: ' + searchTerm, 'info')}
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                <Search size={18} /> Search
                            </button>
                            <div className="vertical-divider" />
                            <select 
                                value={selectedFilterRestaurant}
                                onChange={(e) => setSelectedFilterRestaurant(e.target.value)}
                                style={{ padding: '0.5rem' }}
                            >
                                <option value="all">All Restaurants</option>
                                {restaurants.map(r => <option key={r._id || r.id} value={r.name}>{r.name}</option>)}
                            </select>
                        </div>

                        {/* Category Filter Buttons */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '0.5rem', 
                            flexWrap: 'wrap', 
                            marginTop: '1rem',
                            justifyContent: 'center'
                        }}>
                            {['all', 'veg', 'nonveg', 'tiffins', 'shakes', 'deals'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="food-admin-grid">
                            {filteredFoods.map((food, i) => (
                                <motion.div 
                                    key={food._id || food.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: i * 0.05 }}
                                    className="food-bi-card glass-premium"
                                >
                                    <div className="food-bi-img-wrapper">
                                        <img 
                                            src={food.image?.startsWith('http') || food.image?.startsWith('/') ? food.image : `/${food.image}`} 
                                            alt={food.name}
                                            onError={(e) => {
                                                console.warn('Image failed to load:', food.image);
                                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
                                            }}
                                        />
                                        <div className="food-bi-vendor-tag">{food.restaurant?.toUpperCase()}</div>
                                        {!food.isAvailable && <div className="food-bi-offline-overlay">OFFLINE</div>}
                                    </div>
                                    <div className="food-bi-details">
                                        <div className="food-bi-meta">
                                            <h3>{food.name}</h3>
                                            <span className="food-bi-price">₹{food.price}</span>
                                        </div>
                                        <div className="food-bi-stock-bar">
                                            <div className="stock-level" style={{ width: `${Math.min(food.stock, 100)}%`, background: food.stock < 10 ? '#ef4444' : '#10b981' }} />
                                            <span className="stock-text">QTY: {food.stock}</span>
                                        </div>
                                        <div className="food-bi-actions">
                                            <button className="bi-tool-btn edit" onClick={() => startEdit(food)}><Edit2 size={16} /></button>
                                            <button className="bi-tool-btn delete" onClick={() => deleteFood(food._id || food.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'polls' && (
                    <motion.div 
                        key="polls"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bi-polls-section"
                    >
                        <h3 className="bi-sub-header"><TrendingUp size={20} /> CULINARY_SENTIMENT</h3>
                        <div className="food-admin-grid">
                            {polls.sort((a,b) => b.votes - a.votes).map((poll, i) => (
                                <div key={poll._id || poll.id} className={`food-bi-card glass-premium ${i === 0 ? 'top-voted' : ''}`}>
                                    <div className="food-bi-img-wrapper">
                                        <img src={poll.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'} alt={poll.name} />
                                        {i === 0 && <div className="poll-winner-badge">#1_SENTIMENT</div>}
                                    </div>
                                    <div className="food-bi-details">
                                        <h3>{poll.name}</h3>
                                        <div className="poll-votes-display">
                                            <div className="vote-count">{poll.votes || 0} VOTES</div>
                                        </div>
                                        <div className="poll-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button 
                                                className="bi-promote-btn" 
                                                onClick={() => promoteToMenu(poll._id || poll.id)}
                                                style={{ flex: 1 }}
                                            >
                                                <Zap size={14} /> PROMOTE
                                            </button>
                                            <button 
                                                className="bi-tool-btn edit" 
                                                onClick={() => startEditPoll(poll)}
                                                title="Edit poll"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                className="bi-tool-btn delete" 
                                                onClick={() => handleDeletePoll(poll._id || poll.id, poll.name)}
                                                title="Delete poll"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isAdding && (
                <div className="bi-modal-overlay">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bi-form-modal glass-premium"
                        style={{ maxWidth: '900px', width: '95%', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', padding: '3rem' }}
                    >
                        <div className="bi-modal-main">
                            <div className="bi-modal-header">
                                <h2>
                                    {editingId 
                                        ? (editingType === 'poll' ? 'EDIT_POLL' : 'RECONCILE_ASSET')
                                        : 'DEPLOY_NEW_ASSET'
                                    }
                                </h2>
                                <button className="bi-close-btn" onClick={resetForm}><X size={24} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="bi-form">
                                <div className="bi-form-grid">
                                    <div className="bi-input-group">
                                        <label>ASSET_NAME</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Enter dish name..." />
                                    </div>
                                    <div className="bi-input-group">
                                        <label>CREDIT_VAL (₹)</label>
                                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required placeholder="0.00" />
                                    </div>
                                    <div className="bi-input-group">
                                        <label>VENDOR_NODE</label>
                                        <select value={formData.restaurant} onChange={e => setFormData({...formData, restaurant: e.target.value})} required>
                                            <option value="">SELECT_NODE</option>
                                            {restaurants.map(r => <option key={r._id || r.id} value={r.name}>{r.name ? r.name.toUpperCase() : 'UNKNOWN'}</option>)}
                                        </select>
                                    </div>
                                    <div className="bi-input-group">
                                        <label>ASSET_CATEGORY</label>
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                            <option value="tiffins">TIFFINS</option>
                                            <option value="veg">VEG</option>
                                            <option value="nonveg">NON-VEG</option>
                                            <option value="shakes">SHAKES</option>
                                            <option value="deals">DEALS</option>
                                        </select>
                                    </div>
                                    <div className="bi-input-group">
                                        <label>STOCK_ALLOCATION</label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
                                    </div>
                                </div>
                                <div className="bi-input-group">
                                    <label>ASSET_IMAGE_SOURCE</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type="text" 
                                            value={formData.image} 
                                            onChange={e => setFormData({...formData, image: e.target.value})} 
                                            placeholder="https://..." 
                                            style={{ flex: 1 }}
                                        />
                                        <input 
                                            type="file" 
                                            id="file-upload" 
                                            hidden 
                                            onChange={handleFileChange} 
                                            accept="image/*"
                                        />
                                        <label htmlFor="file-upload" className="bi-action-btn-primary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Upload size={16} /> BROWSE
                                        </label>
                                    </div>
                                </div>
                                <div className="bi-input-group">
                                    <label>DESCRIPTION_BLOB</label>
                                    <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the culinary asset..." />
                                </div>
                                <button type="submit" className="bi-form-submit-btn">
                                    {editingId 
                                        ? (editingType === 'poll' ? 'UPDATE_POLL' : 'COMMIT_CHANGES')
                                        : 'INITIALIZE_DEPLOYMENT'
                                    } <Check size={18} />
                                </button>
                            </form>
                        </div>

                        {/* Live Preview Console */}
                        <div className="bi-preview-console glass">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--primary)' }}>
                                <Zap size={14} fill="currentColor" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px' }}>LIVE_STREAM_PREVIEW</span>
                            </div>
                            
                            <div className="bi-preview-card">
                                <div className="bi-preview-img">
                                    <img src={formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'} alt="preview" />
                                    {formData.price && <div className="bi-preview-tag">₹{formData.price}</div>}
                                </div>
                                <div className="bi-preview-content">
                                    <h4>{formData.name || 'NEW_ENTITY'}</h4>
                                    <p>{formData.restaurant ? formData.restaurant.toUpperCase() : 'NODE_PENDING'}</p>
                                    <div className="bi-preview-meta">
                                        <span>STOCK: {formData.stock}</span>
                                        <div className={`bi-status-dot ${formData.isAvailable ? 'online' : 'offline'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="bi-system-metadata">
                                <div>{'>'} KERNEL_ATTACHED: OK</div>
                                <div>{'>'} ASSET_VALIDATION: {formData.name ? 'PASS' : 'WAITING'}</div>
                                <div>{'>'} IO_BUFFER_LIMIT: 256MB</div>
                                <div className="typing-cursor">_</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminFood;
