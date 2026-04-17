const PROJECT_KNOWLEDGE = {
    name: "CodeBite",
    tagline: "Smart Office Food Ordering",
    features: {
        ordering: "Real-time food ordering with live tracking for corporate workspaces.",
        passes: "Weekly Passes (Gold/Premium) offering up to ₹200 discount per meal.",
        groups: "Group Ordering feature to sync meals with your teammates.",
        voting: "Influence the upcoming menu by voting for your favorite dishes.",
        wishlist: "Save your favorite gourmet dishes for one-click ordering later.",
        dashboards: "Direct access for Merchants and Raiders to manage orders and deliveries."
    },
    logistics: {
        delivery_time: "Typically under 25-45 minutes depending on your office area.",
        areas: "Serving major tech hubs and commercial centers across India (Visakhapatnam, Hyderabad, Bangalore, Chennai, etc.).",
        payment: "Secure payment via PhonePe QR, Credit/Debit Cards, Net Banking, and COD."
    },
    support: "Contact our dedicated desk via WhatsApp at 9023865544.",
    mission: "To eliminate 'food-stress' in the modern workspace through artisanal quality and smart logistics."
};

const PASS_DATA = [
    { name: "Weekly Meal Pass", price: 599, discount: "10% Off", benefits: "Free Delivery, Priority Support" },
    { name: "Monthly Meal Pass", price: 1999, discount: "20% Off", benefits: "Exclusive Deals, Birthday Treats, Free Delivery" },
    { name: "Enterprise Pass", price: 4999, discount: "30% Off", benefits: "VIP Support, Team Meals, Catering Discounts" }
];

/**
 * Strict CodeBite Specialist AI.
 * Handles platform-specific queries and rejects general knowledge questions.
 */
export const generateAIResponse = async (history) => {
    if (!history || history.length === 0) return "CodeBite Assistant initialized. How can I help you with your meal today?";
    
    const lastMsgObj = history[history.length - 1];
    const lastMessage = (lastMsgObj.content || lastMsgObj.text || '').toLowerCase();
    
    if (!lastMessage) return "I'm listening! Ask me about CodeBite menus, passes, or order tracking.";

    // Keywords for CodeBite context
    const isProjectContext = [
        'codebite', 'order', 'pass', 'menu', 'wishlist', 'vote', 'rider', 'merchant', 
        'delivery', 'pay', 'checkout', 'price', 'food', 'restaurant', 'office', 'help', 
        'billing', 'support', 'hi', 'hello', 'hey', 'abot'
    ].some(keyword => lastMessage.includes(keyword));

    if (!isProjectContext) {
        return "I am specifically optimized to assist with CodeBite office dining and platform services. For questions outside this scope, I'm currently unable to assist. Is there something about your menu or delivery I can help with?";
    }

    // Specific Response Logic
    if (lastMessage.includes('pass')) {
        let response = "🎫 We offer three premium Meal Pass tiers to help you save on every order:\n\n";
        PASS_DATA.forEach(p => {
            response += `• **${p.name}**\n  💰 Price: ₹${p.price}\n  🎁 Benefit: ${p.discount}\n  ✨ Perks: ${p.benefits}\n\n`;
        });
        response += "You can purchase these directly in the 'Passes' section of the app! Which one would fit your schedule best?";
        return response;
    }

    if (lastMessage.includes('what is') || lastMessage.includes('features')) {
        return "CodeBite is a premier food platform bringing the best of local kitchens to your office.";
    }

    if (lastMessage.includes('delivery') || lastMessage.includes('time') || lastMessage.includes('area')) {
        return `Logistics Info: ${PROJECT_KNOWLEDGE.logistics.areas} ${PROJECT_KNOWLEDGE.logistics.delivery_time}`;
    }

    if (lastMessage.includes('pay') || lastMessage.includes('card') || lastMessage.includes('checkout')) {
        return `We accept multiple modes of payment: ${PROJECT_KNOWLEDGE.logistics.payment}. Our checkout is fully encrypted and secure.`;
    }

    if (lastMessage.includes('contact') || lastMessage.includes('help') || lastMessage.includes('support')) {
        return `You can reach our human support team via ${PROJECT_KNOWLEDGE.support} or check the 'Order History' for live status details.`;
    }

    if (lastMessage.includes('hi') || lastMessage.includes('hello') || lastMessage.includes('hey')) {
        return "Hello! I'm your CodeBite Specialist. I can help you find meals, track deliveries, or explain our Weekly Pass system. What's on your mind?";
    }

    return "I'm here to ensure your CodeBite experience is perfect. Ask me about our gourmet menu, billing, or how to use your Weekly Pass!";
};
