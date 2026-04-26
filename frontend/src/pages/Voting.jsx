import React, { useState, useMemo } from 'react';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, Sparkles, TrendingUp, Search, Info, CheckCircle, Clock, Edit, Save, X, Lightbulb, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Voting.css';

const Voting = () => {
    const { polls, voteForFood } = useFood();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const filteredPolls = useMemo(() => {
        let filtered = polls.filter(poll => 
            poll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poll.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(poll => 
                poll.category?.toLowerCase() === selectedCategory.toLowerCase() ||
                (selectedCategory === 'Main Course' && poll.category === 'main')
            );
        }

        return filtered.sort((a, b) => b.votes - a.votes);
    }, [polls, searchTerm, selectedCategory]);

    const handleVote = async (pollId) => {
        if (!user) {
            showToast('Please login to vote!', 'error');
            return;
        }
        const result = await voteForFood(pollId, user.id);
        if (result.success) {
            showToast('Concept Voted!', 'success');
        } else {
            showToast(result.error || 'Failed to cast vote', 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div className="card text-center" style={{ border: '3px solid var(--primary)', borderRadius: '0', marginBottom: '3rem', padding: '3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--primary)', letterSpacing: '-2px' }}>
                    <Zap size={40} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                    AI Concept Lab
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
                    Vote on <b>Breaking Images</b>. These AI-generated concepts are being tested for the next big menu update. Your votes decide what comes to life!
                </p>
            </div>

            <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
                    <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search concepts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '45px', borderRadius: '12px', height: '54px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['All', 'Tiffins', 'Shakes', 'Main Course', 'Desserts'].map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className="btn" 
                            style={{ 
                                borderRadius: '20px', 
                                padding: '0.5rem 1.25rem', 
                                fontSize: '0.85rem', 
                                fontWeight: 600, 
                                background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                                border: '1px solid ' + (selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.1)'),
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <TrendingUp size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Trending Concepts</h2>
                </div>
                {user && (
                    <div className="glass" style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(255,48,8,0.2)' }}>
                        🚀 LAB CONTRIBUTION: <span style={{ color: 'var(--primary)' }}>{polls.filter(p => p.votedBy?.includes(user?.id)).length} CONCEPTS</span>
                    </div>
                )}
            </div>

            <div className="breaking-grid">
                {filteredPolls.map((poll) => {
                    const hasVoted = poll.votedBy?.includes(user?.id);
                    const status = poll.votes > 15 ? 'IN_TESTING' : poll.votes > 10 ? 'PROTOTYPE' : 'IDEATION';

                    return (
                        <div key={poll.id} className="concept-card glass" style={{ border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <div className="concept-image-container">
                                <img src={poll.image} alt={poll.name} className="concept-image" />
                                <div className="vote-badge">
                                    <TrendingUp size={14} /> {poll.votes} VOTES
                                </div>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '15px', 
                                    left: '15px', 
                                    background: status === 'IN_TESTING' ? '#10b981' : '#3b82f6', 
                                    color: 'white', 
                                    padding: '4px 10px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.6rem', 
                                    fontWeight: 900,
                                    letterSpacing: '1px'
                                }}>
                                    {status}
                                </div>
                            </div>
                            <div className="concept-info">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3>{poll.name}</h3>
                                    <button 
                                        className="share-btn" 
                                        onClick={() => showToast('Concept Link Copied!', 'success')}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: '0.5rem 0 1.5rem' }}>{poll.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ANTICIPATED</div>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{poll.price}</span>
                                    </div>
                                    <button
                                        className={`btn ${hasVoted ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => handleVote(poll.id)}
                                        style={{ borderRadius: '12px', textTransform: 'uppercase', fontWeight: 'bold', padding: '0.6rem 1.2rem' }}
                                    >
                                        {hasVoted ? <CheckCircle size={18} /> : 'VOTE'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Voting;
