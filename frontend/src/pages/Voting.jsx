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
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredPolls = useMemo(() => {
        const filtered = polls.filter(poll => 
            poll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poll.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filtered.sort((a, b) => b.votes - a.votes);
    }, [polls, searchTerm]);

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

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search concepts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '45px', borderRadius: '0', height: '50px', fontSize: '1.1rem' }}
                    />
                </div>
            </div>

            <div className="breaking-grid">
                {filteredPolls.map((poll) => {
                    const hasVoted = poll.votedBy?.includes(user?.id);

                    return (
                        <div key={poll.id} className="concept-card">
                            <div className="concept-image-container">
                                <img src={poll.image} alt={poll.name} className="concept-image" />
                                <div className="vote-badge">
                                    <TrendingUp size={14} /> {poll.votes} VOTES
                                </div>
                            </div>
                            <div className="concept-info">
                                <h3>{poll.name}</h3>
                                <p>{poll.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{poll.price} Pre-release</span>
                                    <button
                                        className={`btn ${hasVoted ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => handleVote(poll.id)}
                                        style={{ borderRadius: '0', textTransform: 'uppercase', fontWeight: 'bold' }}
                                    >
                                        {hasVoted ? 'Voted' : 'Vote Hot'}
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
