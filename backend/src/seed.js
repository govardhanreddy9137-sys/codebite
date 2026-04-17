import Food from './models/Food.js';
import Poll from './models/Poll.js';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Order from './models/Order.js';

const initialOrders = [
  {
    userId: '000000000000000000000002', 
    items: [{ id: '101', name: 'sambar Idli (4 pcs)', price: 60, quantity: 2 }],
    total: 120,
    status: 'pending',
    deliveryRoom: 'Conference Room A',
    customerPhone: '9999999999'
  },
  {
    userId: '000000000000000000000002',
    items: [{ id: '102', name: 'Masala Dosa', price: 85, quantity: 1 }],
    total: 85,
    status: 'preparing',
    deliveryRoom: 'Desk 42',
    customerPhone: '9999999999'
  },
  {
    userId: '000000000000000000000002',
    items: [{ id: '202', name: 'Chicken Fry Piece Biryani', price: 199, quantity: 1 }],
    total: 199,
    status: 'delivered',
    deliveryRoom: 'Reception',
    customerPhone: '9999999999'
  }
];

const initialFoods = [
  { 
    id: 101, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'tiffens', 
    name: 'sambar Idli (4 pcs)', 
    price: 60, 
    discount: 20,
    description: 'Soft idli with chutney & sambar.', 
    aiDescription: 'Cloud-like steamed rice cakes, fermented to perfection. Served with our signature slow-simmered sambar and hand-ground coconut relish.',
    image: '/src/images/Idli Sambar.webp'
  },
  { 
    id: 102, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'tiffens', 
    name: 'Masala Dosa', 
    price: 85, 
    description: 'Crispy dosa with potato masala.', 
    aiDescription: 'Golden-brown, paper-thin crepe filled with a savory blend of spiced potatoes. A masterclass in crunch.',
    image: 'src/images/OIP.webp' 
  },
  { 
    id: 103, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'veg', 
    name: 'Tomato Pappu + Rice', 
    price: 120, 
    description: 'Andhra tomato dal with rice.', 
    aiDescription: 'Traditional Andhra-style lentils infused with tangy tomatoes. Fluffy basmati rice.',
    image: 'src/images/tomato pappu.jpg' 
  },
  { 
    id: 104, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'nonveg', 
    name: 'Chicken Curry + Rice', 
    price: 190, 
    description: 'Home-style chicken curry.', 
    aiDescription: 'Tender chicken simmered in a rich, spicy gravy of toasted spices. Pure comfort.',
    image: 'src/images/Chicken Curry + Rice.webp' 
  },
  { 
    id: 201, 
    restaurant: 'Andhra Meals', 
    category: 'veg', 
    name: 'Veg Meals', 
    price: 190, 
    description: 'Rice + sambar + curry + curd + pickle.', 
    aiDescription: 'A balanced spectrum of flavors: dal, seasonal curries, tangy rasam, and cool curd.',
    image: '/src/images/pickles.png' 
  },
  { 
    id: 202, 
    restaurant: 'Andhra Meals', 
    category: 'nonveg', 
    name: 'Chicken Fry Piece Biryani', 
    price: 199, 
    description: 'Biryani with chicken fry piece.', 
    aiDescription: 'Fragrant Dum biryani crowned with spicy Andhra-style fried chicken.',
    image: 'src/images/masala dosa.jpg' 
  },
  { 
    id: 301, 
    restaurant: 'Home Made Food', 
    category: 'veg', 
    name: 'Dal Fry + Rice', 
    price: 140, 
    description: 'Comfort dal fry with rice.', 
    aiDescription: 'Aromatic yellow lentils tempered with ghee, cumin, and garlic. Served with steamed basmati.',
    image: 'src/images/Butter Chicken.webp' 
  },
  { 
    id: 302, 
    restaurant: 'Home Made Food', 
    category: 'veg', 
    name: 'Aloo Curry + Chapati', 
    price: 130, 
    description: 'Aloo curry with chapati.', 
    aiDescription: 'Soft whole wheat flatbreads paired with spiced potato curry in tomato-onion gravy.',
    image: 'src/images/Aloo Paratha.webp' 
  },
  { 
    id: 303, 
    restaurant: 'Home Made Food', 
    category: 'tiffens', 
    name: 'Upma', 
    price: 40, 
    description: 'Soft rava upma.', 
    aiDescription: 'Fluffy semolina porridge tempered with mustard seeds, curry leaves, and roasted peanuts.',
    image: 'src/images/Idli Sambar.webp' 
  },
  { 
    id: 304, 
    restaurant: 'Home Made Food', 
    category: 'nonveg', 
    name: 'Egg Curry + Rice', 
    price: 160, 
    description: 'Homemade egg curry.', 
    aiDescription: 'Hard-boiled eggs in a spicy onion-tomato gravy with aromatic spices.',
    image: 'src/images/Mutton Biryani.webp' 
  },
  { 
    id: 401, 
    restaurant: 'Kalpana House', 
    category: 'tiffens', 
    name: 'Punugulu', 
    price: 30, 
    description: 'Crispy punugulu with chutney.', 
    aiDescription: 'Crispy fried rice flour dumplings, Andhra-style street food with green chutney.',
    image: 'src/images/Filter Coffee.webp' 
  },
  { 
    id: 402, 
    restaurant: 'Kalpana House', 
    category: 'veg', 
    name: 'Paneer Butter Masala', 
    price: 190, 
    description: 'Creamy paneer curry with rice.', 
    aiDescription: 'Silky cubes of fresh cottage cheese bathed in a creamy, buttery tomato reduction.',
    image: 'src/images/veg meals.avif' 
  },
  { 
    id: 403, 
    restaurant: 'Kalpana House', 
    category: 'veg', 
    name: 'Curd Rice', 
    price: 70, 
    description: 'Cooling curd rice.', 
    aiDescription: 'Creamy yogurt rice tempered with mustard seeds and curry leaves. Perfect summer meal.',
    image: 'src/images/chicken biryani.webp' 
  },
  { 
    id: 404, 
    restaurant: 'Kalpana House', 
    category: 'nonveg', 
    name: 'Chicken 65', 
    price: 199, 
    description: 'Spicy deep-fried chicken.', 
    aiDescription: 'Crispy chicken bites tossed in a vibrant blend of ginger, garlic, and fiery red chilies.',
    image: 'src/images/masala dosa.jpg' 
  },
  { 
    id: 501, 
    restaurant: 'Ammama Garri Illu', 
    category: 'tiffens', 
    name: 'Vada (2 pcs)', 
    price: 55, 
    description: 'Crispy medu vada.', 
    aiDescription: 'Golden-brown lentil donuts, crispy outside and fluffy inside. Served with sambar.',
    image: 'src/images/Butter Chicken.webp' 
  },
  { 
    id: 502, 
    restaurant: 'Ammama Garri Illu', 
    category: 'veg', 
    name: 'Pulihora', 
    price: 80, 
    description: 'Rice with tamarind and tempering.', 
    aiDescription: 'Tangy tamarind rice with peanuts, sesame seeds, and aromatic tempering.',
    image: 'src/images/Aloo Paratha.webp' 
  },
  { 
    id: 504, 
    restaurant: 'Ammama Garri Illu', 
    category: 'nonveg', 
    name: 'Chicken Pulusu', 
    price: 180, 
    description: 'Andhra chicken curry with rice.', 
    aiDescription: 'Tangy Andhra-style chicken curry with perfect balance of spices.',
    image: '/images/chicken-pulusu.jpg' 
  },
  // Biryani Paradise Items
  { 
    id: 601, 
    restaurant: 'Biryani Paradise', 
    category: 'nonveg', 
    name: 'Hyderabadi Dum Biryani', 
    price: 250, 
    description: 'Authentic Hyderabadi biryani with raita.', 
    aiDescription: 'Aromatic basmati rice layered with tender meat and exotic spices.',
    image: '/images/hyderabadi-biryani.jpg' 
  },
  { 
    id: 602, 
    restaurant: 'Biryani Paradise', 
    category: 'nonveg', 
    name: 'Chicken 65 Biryani', 
    price: 280, 
    description: 'Spicy Chicken 65 with biryani rice.', 
    aiDescription: 'Fusion of crispy Chicken 65 and fragrant biryani rice.',
    image: '/images/chicken65-biryani.jpg' 
  },
  { 
    id: 603, 
    restaurant: 'Biryani Paradise', 
    category: 'veg', 
    name: 'Veg Dum Biryani', 
    price: 220, 
    description: 'Mixed vegetables biryani with raita.', 
    aiDescription: 'Colorful medley of vegetables cooked in dum style with aromatic rice.',
    image: '/images/veg-biryani.jpg' 
  },
  { 
    id: 604, 
    restaurant: 'Biryani Paradise', 
    category: 'nonveg', 
    name: 'Mutton Biryani', 
    price: 320, 
    description: 'Traditional mutton dum biryani.', 
    aiDescription: 'Rich and tender mutton pieces slow-cooked with basmati rice.',
    image: '/images/mutton-biryani.jpg' 
  },
  // Taste of Punjab Items
  { 
    id: 701, 
    restaurant: 'Taste of Punjab', 
    category: 'nonveg', 
    name: 'Butter Chicken', 
    price: 280, 
    description: 'Creamy butter chicken with naan.', 
    aiDescription: 'Tender chicken in rich tomato-butter gravy with aromatic spices.',
    image: '/images/butter-chicken.jpg' 
  },
  { 
    id: 702, 
    restaurant: 'Taste of Punjab', 
    category: 'veg', 
    name: 'Paneer Butter Masala', 
    price: 240, 
    description: 'Creamy paneer curry with naan.', 
    aiDescription: 'Soft cottage cheese cubes in rich buttery tomato gravy.',
    image: '/images/paneer-butter-masala.jpg' 
  },
  { 
    id: 703, 
    restaurant: 'Taste of Punjab', 
    category: 'nonveg', 
    name: 'Dal Makhani', 
    price: 180, 
    description: 'Creamy black lentils with rice.', 
    aiDescription: 'Slow-cooked black lentils in rich buttery gravy.',
    image: '/images/dal-makhani.jpg' 
  },
  { 
    id: 704, 
    restaurant: 'Taste of Punjab', 
    category: 'veg', 
    name: 'Aloo Gobi', 
    price: 160, 
    description: 'Potato and cauliflower dry curry.', 
    aiDescription: 'Dry curry of potatoes and cauliflower with Punjabi spices.',
    image: '/images/aloo-gobi.jpg' 
  },
  { 
    id: 705, 
    restaurant: 'Taste of Punjab', 
    category: 'nonveg', 
    name: 'Chicken Tikka Masala', 
    price: 260, 
    description: 'Grilled chicken in creamy masala.', 
    aiDescription: 'Smoky grilled chicken chunks in rich creamy tomato gravy.',
    image: '/images/chicken-tikka-masala.jpg' 
  },
  // New "Hotels" added as per user request
  {
    id: 801,
    restaurant: 'Hotel Taj Palace',
    category: 'nonveg',
    name: 'Prawns Biryani',
    price: 350,
    description: 'Premium basmati rice with spiced prawns.',
    aiDescription: 'A seafood masterclass featuring ocean-fresh prawns and aged basmati.',
    image: 'src/images/Idli Sambar.webp'
  },
  {
    id: 802,
    restaurant: 'Hotel Taj Palace',
    category: 'nonveg',
    name: 'Fish Fry',
    price: 220,
    description: 'Crispy fried fish with Andhra spices.',
    aiDescription: 'Golden-fried fresh fish fillets with a crunchy spiced coating.',
    image: 'src/images/Mutton Biryani.webp'
  },
  {
    id: 901,
    restaurant: 'Paradise Hotel',
    category: 'nonveg',
    name: 'Special Chicken Biryani',
    price: 290,
    description: 'World-famous Paradise special biryani.',
    aiDescription: 'The legendary taste of Hyderabad, slow-cooked to perfection.',
    image: 'src/images/Filter Coffee.webp'
  },
  {
    id: 1001,
    restaurant: 'Hotel Swagath',
    category: 'tiffens',
    name: 'Mysore Bajji',
    price: 50,
    description: 'Soft and fluffy Mysore-style bonda.',
    aiDescription: 'Golden globes of delight, airy inside and perfectly spiced.',
    image: 'src/images/veg meals.avif'
  },
  {
    id: 1101,
    restaurant: 'Biryani Zone',
    category: 'nonveg',
    name: 'Mutton Fry Piece Biryani',
    price: 380,
    description: 'Special mutton fry pieces served with aromatic biryani rice.',
    aiDescription: 'The perfect balance of tender mutton fry and spicy dum biryani rice.',
    image: 'src/images/chicken biryani.webp'
  },
  {
    id: 1102,
    restaurant: 'Biryani Zone',
    category: 'nonveg',
    name: 'Chicken 65',
    price: 240,
    description: 'Classic spicy deep-fried chicken appetizer.',
    aiDescription: 'Crispy, spicy, and tangy - a Hyderabad street food legend.',
    image: 'src/images/masala dosa.jpg'
  },
  {
    id: 1201,
    restaurant: 'Srikanya',
    category: 'nonveg',
    name: 'Andhra Chicken Curry',
    price: 260,
    description: 'Traditional Guntur style chicken curry.',
    aiDescription: 'Authentic fiery spice blend from the heart of Andhra Pradesh.',
    image: 'src/images/Butter Chicken.webp'
  },
  {
    id: 1202,
    restaurant: 'Srikanya',
    category: 'veg',
    name: 'Gutthi Vankaya',
    price: 190,
    description: 'Stuffed brinjal curry in spicy peanut gravy.',
    aiDescription: 'A royal vegetarian delicacy from Andhra coastal cuisine.',
    image: 'src/images/Aloo Paratha.webp'
  },
  {
    id: 1301,
    restaurant: 'Mehfil',
    category: 'nonveg',
    name: 'Special Mutton Biryani',
    price: 360,
    description: 'Legendary Mehfil mutton biryani with half-boiled egg.',
    aiDescription: 'Generous portions, tender meat, and the spice signature of Mehfil.',
    image: 'src/images/Idli Sambar.webp'
  },
  {
    id: 1302,
    restaurant: 'Mehfil',
    category: 'nonveg',
    name: 'Tandoori Platter',
    price: 450,
    description: 'Assorted tandoori kebabs, malai tikka, and tangdi.',
    aiDescription: 'A slow-roasted feast featuring various marinated chicken cuts.',
    image: 'src/images/Mutton Biryani.webp'
  },
  {
    id: 405,
    restaurant: 'Kalpana House',
    category: 'tiffens',
    name: 'Mirchi Bajji',
    price: 45,
    description: 'Crispy green chili fritters served with onions.',
    aiDescription: 'Golden deep-fried chili bursts with a savory nut stuffing. A local favorite.',
    image: 'src/images/Filter Coffee.webp'
  },
  {
    id: 406,
    restaurant: 'Kalpana House',
    category: 'veg',
    name: 'Dal Tadka + Rice',
    price: 110,
    description: 'Spiced yellow lentils with steamed rice.',
    aiDescription: 'Tempered lentils with cumin and ghee for a comforting and nutritious lunch.',
    image: 'src/images/veg meals.avif'
  },
  {
    id: 105,
    restaurant: 'Amma Chetti Vanta',
    category: 'nonveg',
    name: 'Gongura Mutton + Rice',
    price: 260,
    description: 'Andhra special sorrel leaf mutton with rice.',
    aiDescription: 'Tender mutton pieces infused with the tangy zing of Roselle leaves. Pure Andhra soul.',
    image: 'src/images/chicken biryani.webp'
  },
  {
    id: 106,
    restaurant: 'Amma Chetti Vanta',
    category: 'veg',
    name: 'Sambar Rice',
    price: 90,
    description: 'Traditional slow cooked sambar rice with ghee.',
    aiDescription: 'A harmonious blend of rice, lentils, and mixed vegetables, finished with aromatic ghee.',
    image: 'src/images/masala dosa.jpg'
  },
  {
    id: 203,
    restaurant: 'Andhra Meals',
    category: 'nonveg',
    name: 'Chicken Fry',
    price: 150,
    description: 'Classic spicy Andhra chicken fry.',
    aiDescription: 'Bone-in chicken slow-roasted with black pepper, curry leaves, and Guntur chilies.',
    image: 'src/images/Butter Chicken.webp'
  },
  {
    id: 204,
    restaurant: 'Andhra Meals',
    category: 'nonveg',
    name: 'Prawns Iguru',
    price: 320,
    description: 'Semi-dry prawns curry Andhra style.',
    aiDescription: 'Fresh ocean prawns simmered in a thick, spicy onion-tomato masala until perfection.',
    image: 'src/images/Aloo Paratha.webp'
  },
  {
    id: 305,
    restaurant: 'Home Made Food',
    category: 'veg',
    name: 'Mixed Veg Curry + Chapati',
    price: 140,
    description: 'Fresh seasonal vegetables with soft chapatis.',
    aiDescription: 'A light and healthy medley of seasonal vegetables in a mild, nutritious gravy.',
    image: 'src/images/Idli Sambar.webp'
  },
  {
    id: 306,
    restaurant: 'Home Made Food',
    category: 'nonveg',
    name: 'Egg Biryani',
    price: 170,
    description: 'Light and home style egg biryani.',
    aiDescription: 'Fragrant long-grain rice cooked with boiled eggs and delicate spices - easy on the stomach.',
    image: 'src/images/Mutton Biryani.webp'
  },
  {
    id: 803,
    restaurant: 'Hotel Taj Palace',
    category: 'nonveg',
    name: 'Mutton Rogan Josh',
    price: 340,
    description: 'Tender mutton cooked in traditional Kashmiri spices.',
    aiDescription: 'Aromatic lamb pieces slow-cooked in a rich, yogurt-based gravy with saffron.',
    image: 'src/images/Filter Coffee.webp'
  },
  {
    id: 804,
    restaurant: 'Hotel Taj Palace',
    category: 'veg',
    name: 'Garlic Naan (2 pcs)',
    price: 90,
    description: 'Soft tandoori naan flavored with roasted garlic.',
    aiDescription: 'Pillowy flatbread baked in a traditional clay oven, infused with fresh garlic and cilantro.',
    image: 'src/images/veg meals.avif'
  },
  {
    id: 902,
    restaurant: 'Paradise Hotel',
    category: 'nonveg',
    name: 'Paradise Chicken 65',
    price: 240,
    description: 'Iconic spicy deep fried chicken.',
    aiDescription: 'Flaming red, crispy chicken bites marinated in secret spices and tempered with green chilies.',
    image: 'src/images/chicken biryani.webp'
  },
  {
    id: 903,
    restaurant: 'Paradise Hotel',
    category: 'veg',
    name: 'Veg Dum Biryani',
    price: 210,
    description: 'Slow cooked vegetable biryani.',
    aiDescription: 'Fragrant basmati rice layered with garden-fresh vegetables and caramelized onions.',
    image: 'src/images/masala dosa.jpg'
  },
  {
    id: 1002,
    restaurant: 'Hotel Swagath',
    category: 'tiffens',
    name: 'Set Dosa (3 pcs)',
    price: 75,
    description: 'Soft and spongy dosa served with chutney.',
    aiDescription: 'Small, fluffy pancakes made from fermented batter, served with spicy red chutney.',
    image: 'src/images/Butter Chicken.webp'
  },
  {
    id: 1003,
    restaurant: 'Hotel Swagath',
    category: 'tiffens',
    name: 'Puri Sabji (3 pcs)',
    price: 80,
    description: 'Deep fried wheat bread with potato curry.',
    aiDescription: 'Puffed, golden-brown discs served with a traditional spiced potato and chickpea mash.',
    image: 'src/images/Aloo Paratha.webp'
  },
  {
    id: 1203,
    restaurant: 'Srikanya',
    category: 'nonveg',
    name: 'Natu Kodi Pulusu',
    price: 280,
    description: 'Spicy country chicken curry Andhra style.',
    aiDescription: 'Rustic and fiery farm-raised chicken simmered in a rich poppy seed and coconut gravy.',
    image: 'src/images/Idli Sambar.webp'
  },
  {
    id: 1204,
    restaurant: 'Srikanya',
    category: 'veg',
    name: 'Palakura Pappu',
    price: 130,
    description: 'Lentils cooked with fresh spinach.',
    aiDescription: 'Earthy and nutritious blend of pigeon peas and fresh green spinach, tempered with garlic.',
    image: 'src/images/Mutton Biryani.webp'
  },
  {
    id: 1303,
    restaurant: 'Mehfil',
    category: 'nonveg',
    name: 'Mutton Keema',
    price: 420,
    description: 'Spiced minced mutton served with pav.',
    aiDescription: 'Smoky, hand-minced lamb simmered in a heavy bottom pot with slow-roasted spices.',
    image: 'src/images/Filter Coffee.webp'
  },
  {
    id: 1304,
    restaurant: 'Mehfil',
    category: 'nonveg',
    name: 'Chicken Malai Tikka',
    price: 320,
    description: 'Creamy and mild chicken kebabs.',
    aiDescription: 'Velvety chicken chunks marinated in cream, cheese, and cardamom before being clay-oven roasted.',
    image: 'src/images/veg meals.avif'
  }
];

const initialPolls = [
  { id: 101, name: 'Hakka Noodles', price: 159, description: 'Vegetable hakka noodles with schezwan sauce.', image: 'src/images/chicken biryani.webp', votes: 12, votedBy: [] },
  { id: 102, name: 'Burger & Fries', price: 179, description: 'Classic veg patty burger with crispy fries.', image: '/src/images/burger_fries.png', votes: 24, votedBy: [] },
  { id: 103, name: 'Sushi Platter', price: 299, description: 'Assorted veg sushi rolls with wasabi.', image: 'src/images/Butter Chicken.webp', votes: 8, votedBy: [] },
  { id: 104, name: 'Veg Noodles', price: 189, description: 'Spicy vegetable noodles with fried rice.', image: 'src/images/Aloo Paratha.webp', votes: 15, votedBy: [] },
  { id: 105, name: 'Pizza Margherita', price: 249, description: 'Classic Italian pizza with fresh basil and mozzarella.', image: 'src/images/Idli Sambar.webp', votes: 18, votedBy: [] }
];

const seedUsers = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const defaultEmployee = new User({
      email: 'employee@codebite.com',
      password: 'password123',
      name: 'Default Employee',
      role: 'employee'
    });
    await defaultEmployee.save();
    console.log('👤 Seeded default employee');
  }

  const adminEmail = 'govardhanreddy9137@gmail.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const adminUser = new User({
      _id: '000000000000000000000002',
      email: adminEmail,
      password: 'govardhan@123',
      name: 'Admin User',
      role: 'admin'
    });
    await adminUser.save();
    console.log('👑 Seeded admin user');
  }
};

const seedRestaurants = async () => {
  const restaurants = [
    {
      name: 'Amma Chetti Vanta',
      image: 'src/images/Mutton Biryani.webp',
      rating: 4.2,
      cuisine: 'South Indian • Home Style',
      offer: 'Flat 10% off',
      isOpen: true,
      opensAt: '9:00 AM'
    },
    {
      name: 'Andhra Meals',
      image: 'src/images/Filter Coffee.webp',
      rating: 4.5,
      cuisine: 'Andhra • Spicy',
      offer: '20% Off',
      isOpen: true,
      opensAt: '12:00 PM'
    },
    {
      name: 'Kalpana House',
      image: 'src/images/veg meals.avif',
      rating: 3.8,
      cuisine: 'Tiffens • Snacks',
      offer: 'Buy 2 Get 1',
      isOpen: true,
      opensAt: '7:00 AM'
    },
    {
      name: 'Taste of Punjab',
      image: 'src/images/masala dosa.jpg',
      rating: 4.6,
      cuisine: 'Punjabi • Rich Curry',
      offer: '15% Off',
      isOpen: true,
      opensAt: '12:00 PM'
    },
    {
      name: 'Home Made Food',
      image: 'src/images/Butter Chicken.webp',
      rating: 4.3,
      cuisine: 'Comfort • Minimal Oil',
      offer: 'Daily specials',
      isOpen: true,
      opensAt: '8:00 AM'
    },
    {
      name: 'Ammama Garri Illu',
      image: '/src/images/masala dosa.jpg',
      rating: 4.8,
      cuisine: 'Traditional Andhra • Home Style',
      offer: 'Grandma\'s Special',
      isOpen: true,
      opensAt: '8:00 AM'
    }
  ].map(r => ({ ...r, image: r.image && !r.image.startsWith('/') ? `/${r.image}` : r.image }));

  for (const res of restaurants) {
    await Restaurant.findOneAndUpdate(
      { name: res.name },
      { $set: res },
      { upsert: true, new: true }
    );
  }
  console.log('✅ Restaurants seeded/updated');
};

const seedOrders = async () => {
  const orderCount = await Order.countDocuments();
  console.log(`📊 Order count: ${orderCount}`);
  if (orderCount === 0) {
    await Order.insertMany(initialOrders);
    console.log('📦 Seeded initial orders');
  }
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedIfEmpty = async () => {
  await seedUsers();
  
  // Try to seed restaurants from JSON first
  const restaurantsJsonPath = path.join(__dirname, '..', '..', 'data', 'restaurants_utf8.json');
  if (fs.existsSync(restaurantsJsonPath)) {
    try {
      const restaurantsData = JSON.parse(fs.readFileSync(restaurantsJsonPath, 'utf8').replace(/^\uFEFF/, ''));
      const restaurants = Array.isArray(restaurantsData) ? restaurantsData : restaurantsData.value;
      if (restaurants) {
        for (const res of restaurants) {
          await Restaurant.findOneAndUpdate(
            { name: res.name },
            { $set: { ...res, image: res.image && !res.image.startsWith('/') ? `/${res.image}` : res.image } },
            { upsert: true, new: true }
          );
        }
        console.log('✅ Restaurants seeded from JSON');
      }
    } catch (e) {
      console.error('❌ Error seeding restaurants from JSON:', e.message);
      await seedRestaurants();
    }
  } else {
    await seedRestaurants();
  }

  await seedOrders();

  const foodCount = await Food.countDocuments();
  const foodsJsonPath = path.join(__dirname, '..', '..', 'data', 'foods_utf8.json');
  
  if (fs.existsSync(foodsJsonPath)) {
    try {
      const rawData = fs.readFileSync(foodsJsonPath, 'utf8');
      const foodsData = JSON.parse(rawData.replace(/^\uFEFF/, ''));
      const jsonFoods = Array.isArray(foodsData) ? foodsData : (foodsData.value || []);
      
      if (jsonFoods.length > 0) {
        // ONLY seed if the database is truly empty.
        // This prevents admin changes (additions/deletions) from being wiped on every restart.
        if (foodCount === 0) {
          console.log(`🧹 Initial seeding: JSON has ${jsonFoods.length} foods.`);
          
          // Normalize image paths: ensure leading slash and unified routing
          const normalizedFoods = jsonFoods.map(f => {
            let img = f.image || '';
            // If it's a local path (not http), normalize it
            if (img && !img.startsWith('http')) {
              // Convert src/images/ to /images/
              img = img.replace(/^(\/)?src\/images\//, '/images/');
              // Ensure leading slash
              if (!img.startsWith('/')) img = '/' + img;
              // Clean up double slashes
              img = img.replace(/\/+/g, '/');
            }
            return { ...f, image: img };
          });
          
          await Food.insertMany(normalizedFoods);
          console.log(`🍱 Seeded ${normalizedFoods.length} foods from JSON with normalized paths`);
        } else {
          console.log(`🍱 Database already contains ${foodCount} foods. Skipping initial seed to preserve administrative changes.`);
        }
      }
    } catch (e) {
      console.error('❌ Error seeding foods from JSON:', e.message);
      if (foodCount === 0) {
        await Food.insertMany(initialFoods);
        console.log('🍱 Seeded foods from fallback hardcoded list');
      }
    }
  } else if (foodCount === 0) {
    await Food.insertMany(initialFoods);
    console.log('🍱 Seeded foods from fallback hardcoded list');
  }

  const pollCount = await Poll.countDocuments();
  if (pollCount === 0) {
    await Poll.insertMany(initialPolls);
    console.log('🗳 Seeded polls');
  }

  // --- MIGRATION STEP: Normalize ALL existing food images ---
  try {
    console.log('🔧 Running Data Migration: Normalizing existing food image paths...');
    const allFoods = await Food.find({});
    let updateCount = 0;
    
    for (const f of allFoods) {
      let img = f.image || '';
      let originalImg = img;
      
      if (img && !img.startsWith('http')) {
        // 1. Uniformly convert src/images/ or images/ to /images/
        img = img.replace(/^(\/)?src\/images\//, '/images/');
        img = img.replace(/^(\/)?images\//, '/images/');
        
        // 2. Ensure leading slash
        if (!img.startsWith('/')) img = '/' + img;
        
        // 3. Clean up duplicate slashes and handle spaces
        img = img.replace(/\/+/g, '/');
        
        if (img !== originalImg) {
          f.image = img;
          await f.save();
          updateCount++;
        }
      }
    }
    if (updateCount > 0) {
      console.log(`✅ Migration complete: Successfully normalized ${updateCount} food items.`);
    } else {
      console.log('✅ Migration complete: All item paths are already healthy.');
    }
  } catch (migErr) {
    console.error('❌ Data Migration Failed:', migErr);
  }
};
