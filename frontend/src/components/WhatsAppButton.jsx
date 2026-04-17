import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
    const phoneNumber = '9023865544';
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleWhatsAppClick = (message = '') => {
        const defaultMessage = message || 'Hello! I need help with my food order.';
        const encodedMessage = encodeURIComponent(defaultMessage);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    const quickMessages = [
        'I want to place an order',
        'What are today\'s specials?',
        'I need help with my order',
        'Delivery status inquiry'
    ];

    return (
        <div className="whatsapp-float-container">
            <div className={`whatsapp-quick-messages ${isExpanded ? 'expanded' : ''}`}>
                {quickMessages.map((msg, index) => (
                    <button
                        key={index}
                        className="quick-message-btn"
                        onClick={() => handleWhatsAppClick(msg)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {msg}
                    </button>
                ))}
            </div>
            
            <button
                className="whatsapp-float-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title="Chat on WhatsApp"
            >
                {isExpanded ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
};

export default WhatsAppButton;
