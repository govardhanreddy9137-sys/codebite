import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Leaf, Coffee, CreditCard, Check, Shield, Info, Smartphone, Mail, Globe, Zap, Clock, Package } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Subscriptions.css';

const Subscriptions = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            id: 'home-pass-15days',
            name: '15 Days Home Pass',
            price: 1500,
            durationDays: 15,
            icon: <Calendar size={40} className="plan-icon text-green" />,
            description: 'Active for 15 days. Use this pass to order your daily meals.',
            features: ['Valid for 15 days', 'Fixed validity', 'Priority Support']
        },
        {
            id: 'home-pass-3months',
            name: '3 Months Home Pass',
            price: 7000,
            durationDays: 90,
            icon: <Globe size={40} className="plan-icon text-green" />,
            description: 'Active for 3 months. Perfect for long term convenience.',
            features: ['Valid for 3 months', 'Extended benefits', 'Priority Support']
        },
        {
            id: 'home-pass-6months',
            name: '6 Months Home Pass',
            price: 9500,
            durationDays: 180,
            icon: <Globe size={40} className="plan-icon text-green" />,
            description: 'Active for 6 months. Best value for your daily meals.',
            features: ['Valid for 6 months', 'Best Value', 'Priority Support']
        }
    ];

    const handleSubscribe = (plan) => {
        const start = new Date();
        const expiryDate = new Date(start);
        expiryDate.setDate(expiryDate.getDate() + (plan.durationDays || 15));

        if (user.points >= plan.price) {
            updateUser({ points: user.points - plan.price, isSubscriber: true, subscriptionPlan: plan.name, subscriptionExpiry: expiryDate.toISOString() });
            showToast(`Subscription activated! Welcome to the premium club.`, 'success');
        } else {
            showToast('Insufficient Wallet/Points. please recharge to subscribe.', 'error');
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel your active meal subscription?')) {
            updateUser({ isSubscriber: false, subscriptionPlan: null, subscriptionExpiry: null });
            showToast('Subscription cancelled successfully.', 'info');
        }
    };

    return (
        <div className="subscriptions-page container animate-fade-in">
            <div className="subs-header">
                <h1>Home Passes</h1>
                <p>Never skip a meal. Set it and forget it with our newly introduced Home Passes.</p>
            </div>

            {user?.subscription ? (
                <div className="active-subscription-card glass">
                    <div className="active-header">
                        <CheckCircle2 size={48} className="text-green" />
                        <h2>You have an Active Subscription!</h2>
                    </div>
                    <div className="active-details">
                        <h3>{user.subscription.name}</h3>
                        <p>Status: <span className="status-badge">Active</span></p>
                        <p>Started: {new Date(user.subscription.startDate).toLocaleDateString()}</p>
                        {user.subscription.endDate && (
                            <p>Ends: {new Date(user.subscription.endDate).toLocaleDateString()}</p>
                        )}
                    </div>
                    <div className="active-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/menu')}>View Upcoming Meals</button>
                        <button className="btn btn-danger" onClick={handleCancel}>Cancel Plan</button>
                    </div>
                </div>
            ) : (
                <div className="plans-container">
                    {plans.map(plan => (
                        <div key={plan.id} className="plan-card glass">
                            <div className="plan-header">
                                {plan.icon}
                                <h2>{plan.name}</h2>
                                <div className="plan-price">
                                    <span className="currency">₹</span>
                                    <span className="amount">{plan.price}</span>
                                    <span className="period">{plan.durationDays === 30 ? '/month' : '/week'}</span>
                                </div>
                            </div>
                            <p className="plan-desc">{plan.description}</p>
                            <ul className="plan-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx}><CheckCircle2 size={16} /> {feature}</li>
                                ))}
                            </ul>
                            <button className="btn btn-primary subscribe-btn" onClick={() => handleSubscribe(plan)}>
                                Subscribe Now
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
