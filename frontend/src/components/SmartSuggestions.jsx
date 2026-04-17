import React from 'react';
import { Zap, Clock, Brain } from 'lucide-react';

const SmartSuggestions = ({ foods, onSelect }) => {
    // Logic: If it's early, suggest high-protein tiffens. 
    // If user is "Busy", suggest Grab & Go.
    const hour = new Date().getHours();
    
    const suggested = foods.filter(f => {
        if (hour < 11) return f.category === 'tiffens';
        if (hour > 11 && hour < 15) return f.category === 'nonveg' || f.category === 'veg';
        return true;
    }).slice(0, 3);

    return (
        <div className="smart-suggestions-container glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Brain size={24} color="#fbbf24" />
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Smart Suggestions</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Based on current office trends and time</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {suggested.map(item => (
                    <div 
                        key={item._id} 
                        className="suggestion-item glass-hover" 
                        style={{ padding: '1rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onClick={() => onSelect(item)}
                    >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <img 
                                src={item.image} 
                                alt={item.name} 
                                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} 
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{item.category}</span>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>🕒 12m ETA</span>
                                </div>
                                <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem' }}>{item.name}</h4>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Zap size={10} fill="#fbbf24" color="#fbbf24" /> Efficient Choice
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartSuggestions;
