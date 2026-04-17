import React from 'react';
import BaseLogin from '../components/BaseLogin';
import { Store } from 'lucide-react';

const MerchantLogin = () => {
    return (
        <BaseLogin
            role="merchant"
            title="BiteMerchant"
            subtitle="Manage your restaurant business"
            icon={Store}
            primaryColor="#f59e0b"
            secondaryColor="#d97706"
            gradientColors={["#d97706", "#f59e0b", "#fbbf24"]}
            loginPath="/merchant-login"
            dashboardPath="/merchant/dashboard"
            welcomeMessage="Welcome back to your business! 🍽️"
            buttonText="Open Restaurant"
            placeholderEmail="merchant@codebite.com"
        />
    );
};

export default MerchantLogin;
