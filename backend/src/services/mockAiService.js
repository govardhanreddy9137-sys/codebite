/**
 * Mock AI Service to simulate chatbot responses when OpenAI API Key is missing.
 * Provides helpful and context-aware responses for food delivery queries.
 */

const responses = {
  greetings: [
    "Hello! I'm your Code Bite assistant. How can I help you satisfy your cravings today? 🍔",
    "Hi there! Hungry? I can suggest some great restaurants or help you track an order. 🍕",
    "Welcome to Code Bite! I'm here to make your food delivery experience amazing. What's on your mind? 🍜"
  ],
  recommendations: [
    "Based on what's popular, I highly recommend the **Chicken Dum Biryani** from *Paradise Hotel*. It's a local legend! 🍗",
    "If you're looking for something light, *Hotel Swagath* has amazing **Mysore Bajji**. 🥟",
    "Feeling spicy? *Srikanya*'s **Andhra Chicken Curry** is exactly what you need! 🌶️",
    "For vegetarians, the **Paneer Butter Masala** from *Kalpana House* is a huge hit today. 🧀"
  ],
  tracking: [
    "I can help with that! Please provide your **Order ID** (e.g., #CB-1234) and I'll fetch the real-time status for you. 📍",
    "Your order is currently being prepared with love by the chef! It should be out for delivery soon. 👨‍🍳",
    "Checking... valid order found! The rider is just 2 minutes away from your block. Get ready! 🛵"
  ],
  support: [
    "I'm sorry to hear you're having trouble. You can reach our human support team at `support@codebite.com` or call us at `1800-CODE-BITE`. 📞",
    "If an item is missing from your order, please take a photo and send it to our support chat. We'll issue a refund immediately. 💸"
  ],
  default: [
    "That sounds interesting! While I'm in 'Enhanced Smart Mode', I'm still learning. Could you try asking for a recommendation or order status? 😊",
    "I'm here to help! Try saying 'Suggest some food' or 'Where is my order?'"
  ]
};

export const getMockResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
  }
  
  if (msg.includes("suggest") || msg.includes("recommend") || msg.includes("food") || msg.includes("hungry")) {
    return responses.recommendations[Math.floor(Math.random() * responses.recommendations.length)];
  }
  
  if (msg.includes("track") || msg.includes("order") || msg.includes("where")) {
    return responses.tracking[Math.floor(Math.random() * responses.tracking.length)];
  }
  
  if (msg.includes("help") || msg.includes("support") || msg.includes("problem") || msg.includes("wrong")) {
    return responses.support[Math.floor(Math.random() * responses.support.length)];
  }
  
  return responses.default[Math.floor(Math.random() * responses.default.length)];
};
