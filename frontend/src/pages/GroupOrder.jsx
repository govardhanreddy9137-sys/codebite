import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupOrder } from '../context/GroupOrderContext';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, UserPlus, LogOut, ShoppingBag, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './GroupOrder.css';

const GroupOrder = () => {
    const { user } = useAuth();
    const { groupCode, isHost, members, startGroupOrder, joinGroupOrder, exitGroupOrder } = useGroupOrder();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [inputCode, setInputCode] = useState('');

    const handleStartGroup = () => {
        const code = startGroupOrder();
        showToast(`Team order started! Code: ${code}`, 'success');
        navigate('/menu');
    };

    const handleJoin = (e) => {
        if (e) e.preventDefault();
        if (inputCode.length === 6) {
            joinGroupOrder(inputCode, user?.name);
            showToast(`Joined team order: ${inputCode}`, 'success');
            navigate('/menu');
        } else {
            showToast('Please enter a valid 6-character code.', 'warning');
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(groupCode);
        showToast('Team code copied to clipboard!', 'success');
    };

    if (groupCode) {
        return (
            <div className="group-order-container">
                <div className="group-active-card glass">
                    <h2>Active Team Order</h2>
                    <div className="code-display">
                        <span className="code-label">Share this code with your team:</span>
                        <div className="code-box">
                            <strong>{groupCode}</strong>
                            <button onClick={handleCopyCode} className="btn-secondary">
                                <Copy size={16} /> Copy
                            </button>
                        </div>
                    </div>

                    <div className="members-list">
                        <h3>Team Members Joined ({members?.length || 0})</h3>
                        <ul>
                            {members?.map((member, idx) => (
                                <li key={idx}>
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-status">
                                        {member.items?.length > 0 ? `${member.items.length} items added` : 'Choosing...'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="group-actions">
                        <button onClick={() => navigate('/menu')} className="btn-primary">
                            <ShoppingBag size={18} /> Go to Menu
                        </button>
                        <button onClick={exitGroupOrder} className="btn-danger">
                            <LogOut size={18} /> Leave Group Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group-order-container">
            <div className="group-hero">
                <h1>Team Pooling & Group Orders</h1>
                <p>Eat together, save on delivery, and sync your lunch breaks!</p>
            </div>

            <div className="group-options">
                <div className="option-card glass">
                    <div className="option-icon">🚀</div>
                    <h3>Start a New Team Order</h3>
                    <p>Create a group cart and share the code with your floor or meeting room.</p>
                    <button onClick={handleStartGroup} className="btn-primary">
                        <Plus size={18} /> Generate Code
                    </button>
                </div>

                <div className="option-divider">
                    <span>OR</span>
                </div>

                <div className="option-card glass">
                    <div className="option-icon">🤝</div>
                    <h3>Join Existing Order</h3>
                    <p>Have a code from a colleague? Enter it below to add your lunch to their cart.</p>
                    <form onSubmit={handleJoin} className="join-form">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            required
                        />
                        <button type="submit" className="btn-secondary">
                            <UserPlus size={18} /> Join Team Cart
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GroupOrder;
