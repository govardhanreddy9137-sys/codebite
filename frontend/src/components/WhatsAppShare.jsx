import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    MessageCircle, Share2, X, Menu, Star, 
    Clock, MapPin, Phone, ChevronRight, Copy
} from 'lucide-react';
import './WhatsAppShare.css';

const WhatsAppShare = ({ restaurant, cartItems, totalPrice }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('menu');
    const [copied, setCopied] = useState(false);

    const phoneNumber = '919876543210'; // Your business WhatsApp number
    const businessName = 'CodeBite Food Delivery';

    const generateMenuMessage = () => {
        let message = `🍽️ *${businessName} - Menu Card*\n\n`;
        
        if (restaurant) {
            message += `📍 *Restaurant:* ${restaurant.name}\n`;
            message += `🍴 *Cuisine:* ${restaurant.cuisine}\n`;
            message += `⭐ *Rating:* ${restaurant.rating}/5\n`;
            message += `🕐 *Delivery Time:* ${restaurant.deliveryTime}\n\n`;
        }

        if (cartItems && cartItems.length > 0) {
            message += `🛒 *Your Order:*\n`;
            cartItems.forEach((item, index) => {
                message += `${index + 1}. ${item.name} - ₹${item.price} x ${item.quantity}\n`;
            });
            message += `\n💰 *Total:* ₹${totalPrice}\n\n`;
        }

        message += `📱 *Order Now:* https://your-app-link.com\n`;
        message += `🏠 *Visit Us:* https://codebite-food.com\n\n`;
        message += `🎉 *Special Offer:* Use CODEBITE20 for 20% off!`;

        return encodeURIComponent(message);
    };

    const generateBusinessMessage = () => {
        const message = `🚀 *${businessName} - Premium Food Delivery*\n\n` +
            `🍴 *Order delicious food from your favorite restaurants*\n\n` +
            `✅ *Features:*\n` +
            `• 50+ Restaurants\n` +
            `• 30-min Delivery\n` +
            `• 24/7 Service\n` +
            `• Contactless Delivery\n\n` +
            `📱 *Download App:* https://play.google.com/store/codebite\n` +
            `🌐 *Website:* https://codebite-food.com\n\n` +
            `🎯 *Today's Special:* Get 20% off on your first order!\n\n` +
            `📞 *For Orders:* Call +91-9876543210`;

        return encodeURIComponent(message);
    };

    const shareOnWhatsApp = (message) => {
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLink = 'https://codebite-food.com/menu';
    const shareText = `Check out ${businessName} - Amazing food delivered fast! 🍕🍔🥘`;

    return (
        <>
            {/* Floating WhatsApp Button */}
            <motion.div
                className="whatsapp-fab"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
            >
                <MessageCircle size={24} />
                <span className="fab-badge">Help</span>
            </motion.div>

            {/* WhatsApp Modal */}
            {isOpen && (
                <motion.div
                    className="whatsapp-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        className="whatsapp-modal"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="whatsapp-header">
                            <div className="header-info">
                                <div className="business-avatar">
                                    <MessageCircle size={24} />
                                </div>
                                <div className="business-details">
                                    <h3>{businessName}</h3>
                                    <p>Usually replies instantly</p>
                                </div>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="whatsapp-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                                onClick={() => setActiveTab('menu')}
                            >
                                <Menu size={16} />
                                Menu
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'share' ? 'active' : ''}`}
                                onClick={() => setActiveTab('share')}
                            >
                                <Share2 size={16} />
                                Share
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                                onClick={() => setActiveTab('contact')}
                            >
                                <Phone size={16} />
                                Contact
                            </button>
                        </div>

                        {/* Content */}
                        <div className="whatsapp-content">
                            {activeTab === 'menu' && (
                                <div className="menu-tab">
                                    <div className="menu-preview">
                                        <h4>📋 Today's Special Menu</h4>
                                        <div className="menu-items">
                                            <div className="menu-item">
                                                <div className="item-info">
                                                    <h5>🍕 Premium Pizza</h5>
                                                    <p>Italian style with fresh toppings</p>
                                                </div>
                                                <span className="item-price">₹299</span>
                                            </div>
                                            <div className="menu-item">
                                                <div className="item-info">
                                                    <h5>🍔 Classic Burger</h5>
                                                    <p>Juicy patty with special sauce</p>
                                                </div>
                                                <span className="item-price">₹199</span>
                                            </div>
                                            <div className="menu-item">
                                                <div className="item-info">
                                                    <h5>🥘 Biryani Special</h5>
                                                    <p>Aromatic dum biryani with raita</p>
                                                </div>
                                                <span className="item-price">₹349</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="quick-actions">
                                        <button
                                            className="action-btn primary"
                                            onClick={() => shareOnWhatsApp(generateMenuMessage())}
                                        >
                                            <MessageCircle size={16} />
                                            Get Full Menu on WhatsApp
                                        </button>
                                        <button
                                            className="action-btn secondary"
                                            onClick={() => shareOnWhatsApp(generateBusinessMessage())}
                                        >
                                            <Share2 size={16} />
                                            Share Business
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'share' && (
                                <div className="share-tab">
                                    <div className="share-options">
                                        <button
                                            className="share-option"
                                            onClick={() => shareOnWhatsApp(generateMenuMessage())}
                                        >
                                            <MessageCircle size={20} />
                                            <div className="share-info">
                                                <span>Share on WhatsApp</span>
                                                <small>Send menu to friends</small>
                                            </div>
                                            <ChevronRight size={16} />
                                        </button>

                                        <button
                                            className="share-option"
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareLink);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                        >
                                            <Copy size={20} />
                                            <div className="share-info">
                                                <span>Copy Link</span>
                                                <small>{copied ? 'Copied!' : 'Share app link'}</small>
                                            </div>
                                            <ChevronRight size={16} />
                                        </button>

                                        <button
                                            className="share-option"
                                            onClick={() => {
                                                const text = encodeURIComponent(shareText);
                                                window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareLink}`, '_blank');
                                            }}
                                        >
                                            <Share2 size={20} />
                                            <div className="share-info">
                                                <span>Share on Twitter</span>
                                                <small>Tweet about us</small>
                                            </div>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="share-preview">
                                        <h4>Preview</h4>
                                        <div className="preview-card">
                                            <div className="preview-image">
                                                <MessageCircle size={32} />
                                            </div>
                                            <div className="preview-content">
                                                <h5>{businessName}</h5>
                                                <p>{shareText}</p>
                                                <span className="preview-link">{shareLink}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="contact-tab">
                                    <div className="contact-info">
                                        <div className="contact-item">
                                            <Phone size={20} />
                                            <div className="contact-details">
                                                <span>Call Us</span>
                                                <small>+91-98765-43210</small>
                                            </div>
                                            <button
                                                className="contact-btn"
                                                onClick={() => window.open('tel:+919876543210')}
                                            >
                                                Call
                                            </button>
                                        </div>

                                        <div className="contact-item">
                                            <Clock size={20} />
                                            <div className="contact-details">
                                                <span>Business Hours</span>
                                                <small>24/7 Service Available</small>
                                            </div>
                                        </div>

                                        <div className="contact-item">
                                            <MapPin size={20} />
                                            <div className="contact-details">
                                                <span>Service Areas</span>
                                                <small>All major cities</small>
                                            </div>
                                        </div>

                                        <div className="contact-item">
                                            <Star size={20} />
                                            <div className="contact-details">
                                                <span>Customer Rating</span>
                                                <small>4.8/5 (10K+ reviews)</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="contact-form">
                                        <h4>Quick Message</h4>
                                        <textarea
                                            placeholder="Type your message here..."
                                            className="message-input"
                                        />
                                        <button
                                            className="send-btn"
                                            onClick={() => {
                                                const message = encodeURIComponent(document.querySelector('.message-input').value);
                                                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                                            }}
                                        >
                                            <MessageCircle size={16} />
                                            Send on WhatsApp
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default WhatsAppShare;
