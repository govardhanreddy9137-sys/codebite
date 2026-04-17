import React from 'react';
import BaseLogin from '../components/BaseLogin';
import { Truck } from 'lucide-react';

const RaiderLogin = () => {
    return (
        <BaseLogin
            role="rider"
            title="BiteRider"
            subtitle="Ready for your next delivery?"
            icon={Truck}
            primaryColor="#10b981"
            secondaryColor="#059669"
            gradientColors={["#065f46", "#10b981", "#34d399"]}
            loginPath="/rider-login"
            dashboardPath="/rider/dashboard"
            welcomeMessage="Stay Safe! 🛵"
            buttonText="Start Shift"
            placeholderEmail="rider@codebite.com"
        />
    );
};

export default RaiderLogin;
