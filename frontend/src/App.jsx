import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useFood } from './context/FoodContext';
import { useCart } from './context/CartContext';
import { Loader2, Utensils, Sparkles, Clock } from 'lucide-react';

// Layout
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import Subscriptions from './pages/Subscriptions';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardNew from './pages/AdminDashboardNew';
import AdminFood from './pages/AdminFood';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import Voting from './pages/Voting';
import Passes from './pages/Passes';
import GroupOrder from './pages/GroupOrder';
import Payment from './components/Payment';
import ChatBox from './components/ChatBox';
import SplashScreen from './components/SplashScreen';
import WhatsAppButton from './components/WhatsAppButton';
import ErrorBoundary from './components/ErrorBoundary';
import FreeRewardBanner from './components/FreeRewardBanner';
import OrderSuccess from './pages/OrderSuccess';
import HighestVotedItems from './components/HighestVotedItems';
import LoginTest from './components/LoginTest';
import MerchantDashboard from './pages/MerchantDashboard';
import RaiderDashboard from './pages/RaiderDashboard';
import AdminLogin from './pages/AdminLogin';
import MerchantLogin from './pages/MerchantLogin';
import RaiderLogin from './pages/RaiderLogin';

const App = () => {
    const { user, loading: authLoading } = useAuth();
    const { loading: foodLoading } = useFood();
    const { loading: cartLoading } = useCart();
    const [showSplash, setShowSplash] = useState(true);
    const location = useLocation();

    // Combined loading state for data
    const isLoading = authLoading || foodLoading || cartLoading;

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    if (isLoading) {
        return (
            <div className="loading-screen" style={{ background: '#fff', color: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <Utensils size={40} className="spin" />
                    <p style={{ fontWeight: 'bold', marginTop: '10px' }}>CODEBITE LOADING...</p>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="app-main-wrapper">
                <Routes location={location} key={location.pathname}>
                    {/* Public Routes */}
                    <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin" /> : user?.role === 'rider' ? <Navigate to="/rider/dashboard" /> : user?.role === 'merchant' ? <Navigate to="/merchant/dashboard" /> : <Navigate to="/menu" />} />
                    
                    <Route 
                        path="/login" 
                        element={user ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider/dashboard' : user?.role === 'merchant' ? '/merchant/dashboard' : '/menu'} /> : <Login />} 
                    />
                    
                    <Route path="/admin-login" element={user ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider/dashboard' : user?.role === 'merchant' ? '/merchant/dashboard' : '/menu'} /> : <AdminLogin />} />
                    <Route path="/merchant-login" element={user ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider/dashboard' : user?.role === 'merchant' ? '/merchant/dashboard' : '/menu'} /> : <MerchantLogin />} />
                    <Route path="/rider-login" element={user ? <Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider/dashboard' : user?.role === 'merchant' ? '/merchant/dashboard' : '/menu'} /> : <RaiderLogin />} />

                    <Route 
                        path="/menu" 
                        element={
                            user?.role === 'rider' ? <Navigate to="/rider/dashboard" /> :
                            user?.role === 'merchant' ? <Navigate to="/merchant/dashboard" /> :
                            <>
                                <Navbar />
                                <Menu />
                            </>
                        } 
                    />
                    
                    <Route 
                        path="/cart" 
                        element={
                            user ? (
                                <>
                                    <Navbar />
                                    <Cart />
                                </>
                            ) : <Navigate to="/login" />
                        } 
                    />
                    
                    <Route 
                        path="/orders" 
                        element={
                            user ? (
                                <>
                                    <Navbar />
                                    <OrderHistory />
                                </>
                            ) : <Navigate to="/login" />
                        } 
                    />

                    <Route path="/orders/:id" element={user ? <><Navbar /><OrderTracking /></> : <Navigate to="/login" />} />
                    <Route path="/order-success/:id" element={user ? <><Navbar /><OrderSuccess /></> : <Navigate to="/login" />} />
                    <Route path="/subscriptions" element={user ? <><Navbar /><Subscriptions /></> : <Navigate to="/login" />} />
                    <Route path="/wishlist" element={user ? <><Navbar /><Wishlist /></> : <Navigate to="/login" />} />
                    <Route path="/vote" element={user ? <><Navbar /><Voting /></> : <Navigate to="/login" />} />
                    <Route path="/group-order" element={user ? <><Navbar /><GroupOrder /></> : <Navigate to="/login" />} />
                    <Route path="/payment" element={user ? <Payment /> : <Navigate to="/login" />} />
                    <Route path="/passes" element={user ? <><Navbar /><Passes /></> : <Navigate to="/login" />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={user?.role === 'admin' ? <><Navbar /><AdminDashboard /></> : <Navigate to="/admin-login" />} />
                    <Route path="/admin/food" element={user?.role === 'admin' ? <><Navbar /><AdminFood /></> : <Navigate to="/admin-login" />} />
                    <Route path="/admin/orders" element={user?.role === 'admin' ? <><Navbar /><AdminOrders /></> : <Navigate to="/admin-login" />} />
                    <Route path="/admin/users" element={user?.role === 'admin' ? <><Navbar /><AdminUsers /></> : <Navigate to="/admin-login" />} />

                    {/* Merchant & Raider Dashboards */}
                    <Route path="/merchant/dashboard" element={user?.role === 'merchant' ? <MerchantDashboard /> : <Navigate to="/login" />} />
                    <Route path="/rider/dashboard" element={user?.role === 'rider' ? <RaiderDashboard /> : <Navigate to="/login" />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <FreeRewardBanner />
                {user && <ChatBox />}
                <WhatsAppButton />
            </div>
        </ErrorBoundary>
    );
};

export default App;
