import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, User as UserIcon, Truck, Search, AlertCircle, Check, X, RefreshCw, Key, ShieldCheck, Activity, TrendingUp, Award } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await usersAPI.getAll();
            setUsers(data || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('ACCESS_DENIED: Critical database retrieval failure.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            await usersAPI.updateRole(userId, newRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            showToast(`Role updated to ${newRole.toUpperCase()}`, 'success');
        } catch (err) {
            showToast('Permission escalation failed', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <ShieldCheck size={18} color="#ef4444" />;
            case 'rider': return <Truck size={18} color="#3b82f6" />;
            case 'merchant': return <Award size={18} color="#f59e0b" />;
            default: return <UserIcon size={18} color="#10b981" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    };

    if (loading && users.length === 0) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <RefreshCw size={64} color="var(--primary)" />
                </motion.div>
                <h2 style={{ marginTop: '2rem', fontSize: '1.5rem', fontWeight: 600 }}>Loading Users...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container container">
            <div className="admin-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Manage Users</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View and manage user roles</p>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={fetchUsers} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>
            </div>

            <div className="search-container-outer" style={{ marginBottom: '2rem' }}>
                <div className="unique-search-bar" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '0.75rem 1rem', borderRadius: '12px', flex: 1 }}>
                    <Search size={22} style={{ marginRight: '1rem', color: 'var(--text-secondary)' }} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
                    />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {filteredUsers.length} matches
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    <AlertCircle size={24} /> <span>{error}</span>
                </div>
            )}

            <motion.div 
                className="admin-main-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((u, i) => (
                        <motion.div 
                            key={u._id}
                            variants={itemVariants}
                            layout
                            className="admin-card"
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0 }}>{u.name}</h3>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</span>
                                </div>
                                <div>
                                    {getRoleIcon(u.role)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <TrendingUp size={14} />
                                    <span>Points: {u.bitePoints || 0}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity size={14} />
                                    <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <select 
                                    className="unique-search-bar"
                                    style={{ flex: 1, padding: '0.5rem', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                    disabled={updatingId === u._id}
                                >
                                    <option value="user">User</option>
                                    <option value="rider">Rider</option>
                                    <option value="merchant">Merchant</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {updatingId === u._id && <RefreshCw size={18} className="animate-spin text-primary" />}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AdminUsers;
