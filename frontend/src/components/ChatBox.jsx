import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Sparkles, Truck, Utensils, HelpCircle } from 'lucide-react';
import { chatAPI } from '../api.js';
import './ChatBox.css';

const QUICK_REPLIES = [
    { text: "Suggest food", icon: <Utensils size={14} /> },
    { text: "Track my order", icon: <Truck size={14} /> },
    { text: "Top restaurants", icon: <Sparkles size={14} /> },
    { text: "Help me", icon: <HelpCircle size={14} /> }
];

const ChatBox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 'welcome', text: "🍱 Welcome to CodeBite! I'm your dedicated platform specialist. Ask me about our gourmet menu, billing, or how to get the most out of your Weekly Pass!", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const handleSend = async (text) => {
        const messageText = typeof text === 'string' ? text : inputText;
        if (!messageText.trim()) return;

        const newUserMsg = { id: Date.now().toString(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const history = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));
            history.push({ role: 'user', content: messageText });

            const data = await chatAPI.sendMessage(history);
            
            setMessages(prev => [...prev, { 
                id: (Date.now() + 1).toString(), 
                text: data.response || "I'm experiencing a minor sync delay. Could you repeat that?", 
                sender: 'bot'
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                id: (Date.now() + 1).toString(), 
                text: "⚠️ OFFLINE: Unable to reach the platform brain.", 
                sender: 'bot' 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chat-box-wrapper">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="chat-window glass-premium"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    >
                        <div className="chat-header premium-gradient">
                            <div className="chat-title">
                                <div className="bot-avatar">
                                    <Utensils size={20} />
                                    <span className="online-indicator"></span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="bot-name">CODEBITE_EXPERT</span>
                                    <div className="brain-status">
                                        <div className={`status-dot ${isTyping ? 'typing' : ''}`}></div>
                                        <span>{isTyping ? 'Checking Menu...' : 'Direct Platform Link Active'}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="chat-close" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="chat-messages premium-scroll">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-row ${msg.sender}`}>
                                    <div className={`message-bubble ${msg.sender === 'bot' ? 'premium-bot-bubble' : 'user-bubble'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message-row bot">
                                    <div className="message-bubble typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-area-premium">
                            <input 
                                type="text" 
                                placeholder="Ask about menu, passes, status..." 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="send-btn" onClick={() => handleSend()} disabled={!inputText.trim() || isTyping}>
                                <Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button 
                className="chat-toggle-premium"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
                {!isOpen && <div className="active-glow"></div>}
            </motion.button>
        </div>
    );
};

export default ChatBox;
