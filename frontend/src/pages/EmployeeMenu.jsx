import React, { useState } from 'react';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import { 
    Search, Plus, Edit2, Trash2, Filter, Grid, List, 
    Star, Clock, MapPin, DollarSign, Camera, Heart,
    ShoppingCart, TrendingUp, ChefHat, Utensils
} from 'lucide-react';
import './EmployeeMenu.css';

const EmployeeMenu = () => {
    const { foods, addFood, updateFood, deleteFood, restaurants } = useFood();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: 'veg',
        restaurant: '',
        image: '',
        aiDescription: ''
    });

    // Filter foods based on search and filters
    const filteredFoods = foods.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            food.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
        const matchesRestaurant = selectedRestaurant === 'all' || food.restaurant === selectedRestaurant;
        return matchesSearch && matchesCategory && matchesRestaurant;
    });

    // Categories
    const categories = ['all', 'veg', 'nonveg'];

    // Form handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateFood(editingItem.id || editingItem._id, formData);
            } else {
                await addFood(formData);
            }
            resetForm();
        } catch (error) {
            console.error('Error saving food item:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            category: 'veg',
            restaurant: '',
            image: '',
            aiDescription: ''
        });
        setShowAddForm(false);
        setEditingItem(null);
    };

    const handleEdit = (food) => {
        setEditingItem(food);
        setFormData({
            name: food.name,
            price: food.price,
            description: food.description,
            category: food.category,
            restaurant: food.restaurant,
            image: food.image,
            aiDescription: food.aiDescription || ''
        });
        setShowAddForm(true);
    };

    const handleDelete = async (foodId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteFood(foodId);
            } catch (error) {
                console.error('Error deleting food item:', error);
            }
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="employee-menu-container">
            {/* Header */}
            <motion.div 
                className="employee-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="header-content">
                    <div className="header-title">
                        <ChefHat size={32} className="header-icon" />
                        <div>
                            <h1>Menu Management</h1>
                            <p>Manage restaurant menu items and pricing</p>
                        </div>
                    </div>
                    <motion.button
                        className="add-item-btn"
                        onClick={() => setShowAddForm(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus size={20} />
                        Add New Item
                    </motion.button>
                </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div 
                className="filters-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Category:</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-select"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Restaurant:</label>
                        <select 
                            value={selectedRestaurant} 
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Restaurants</option>
                            {restaurants.map(rest => (
                                <option key={rest.name} value={rest.name}>
                                    {rest.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Add/Edit Form Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div 
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => resetForm()}
                    >
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                                <button className="close-btn" onClick={resetForm}>
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="menu-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Item Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                                            required
                                            min="0"
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Restaurant</label>
                                        <select
                                            value={formData.restaurant}
                                            onChange={(e) => setFormData({...formData, restaurant: e.target.value})}
                                            required
                                            className="form-select"
                                        >
                                            <option value="">Select Restaurant</option>
                                            {restaurants.map(rest => (
                                                <option key={rest.name} value={rest.name}>
                                                    {rest.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="form-select"
                                        >
                                            <option value="veg">Vegetarian</option>
                                            <option value="nonveg">Non-Vegetarian</option>
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            required
                                            rows={3}
                                            className="form-textarea"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>AI Description</label>
                                        <textarea
                                            value={formData.aiDescription}
                                            onChange={(e) => setFormData({...formData, aiDescription: e.target.value})}
                                            rows={2}
                                            placeholder="AI-generated description for smart suggestions..."
                                            className="form-textarea"
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Image URL</label>
                                        <input
                                            type="url"
                                            value={formData.image}
                                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                                            placeholder="https://example.com/image.jpg"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={resetForm}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        {editingItem ? 'Update Item' : 'Add Item'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Menu Items Grid/List */}
            <motion.div 
                className={`menu-items ${viewMode}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence mode="wait">
                    {filteredFoods.length === 0 ? (
                        <motion.div 
                            className="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Utensils size={64} className="empty-icon" />
                            <h3>No menu items found</h3>
                            <p>Try adjusting your filters or add new items to the menu</p>
                        </motion.div>
                    ) : (
                        filteredFoods.map((food) => (
                            <motion.div
                                key={food.id || food._id}
                                className={`menu-item-card ${viewMode}`}
                                variants={itemVariants}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(255,48,8,0.2)" }}
                            >
                                <div className="item-image">
                                    <img src={food.image} alt={food.name} />
                                    <div className="item-category">
                                        {food.category === 'veg' ? '🟢' : '🔴'} {food.category}
                                    </div>
                                </div>

                                <div className="item-content">
                                    <div className="item-header">
                                        <h3>{food.name}</h3>
                                        <div className="item-price">₹{food.price}</div>
                                    </div>

                                    <p className="item-description">{food.description}</p>

                                    <div className="item-meta">
                                        <span className="restaurant-name">
                                            <MapPin size={14} />
                                            {food.restaurant}
                                        </span>
                                    </div>

                                    {food.aiDescription && (
                                        <div className="ai-description">
                                            <Star size={12} className="ai-icon" />
                                            <span>{food.aiDescription}</span>
                                        </div>
                                    )}

                                    <div className="item-actions">
                                        <button
                                            className="action-btn edit"
                                            onClick={() => handleEdit(food)}
                                        >
                                            <Edit2 size={16} />
                                            Edit
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDelete(food.id || food._id)}
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default EmployeeMenu;
