import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { foodsAPI, pollsAPI, usersAPI, restaurantsAPI } from '../api.js';

const FoodContext = createContext();

export const useFood = () => useContext(FoodContext);

const fallbackPolls = [];
const fallbackFoods = [];
const fallbackRestaurants = [];

export const FoodProvider = ({ children }) => {
    const [foods, setFoods] = useState([]);
    const [polls, setPolls] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            console.log('FoodContext: Starting to load data...');
            setLoading(true);
            try {
                const [foodsRes, pollsRes, restaurantsRes] = await Promise.allSettled([
                    foodsAPI.get(),
                    pollsAPI.get(),
                    restaurantsAPI.get()
                ]);

                console.log('FoodContext: Foods result:', foodsRes);
                console.log('FoodContext: Polls result:', pollsRes);
                console.log('FoodContext: Restaurants result:', restaurantsRes);

                if (foodsRes.status === 'fulfilled') {
                    console.log('FoodContext: Setting foods from API:', foodsRes.value);
                    setFoods(foodsRes.value);
                } else {
                    console.error('Foods fetch failed, using fallback:', foodsRes.reason);
                    setFoods(fallbackFoods);
                }

                if (pollsRes.status === 'fulfilled') {
                    setPolls(pollsRes.value);
                } else {
                    console.error('Polls fetch failed, using fallback:', pollsRes.reason);
                    setPolls(fallbackPolls);
                }

                if (restaurantsRes.status === 'fulfilled') {
                    setRestaurants(restaurantsRes.value);
                } else {
                    console.error('Restaurants fetch failed, using fallback:', restaurantsRes.reason);
                    setRestaurants(fallbackRestaurants);
                }
            } catch (err) {
                console.group('CRITICAL_SYSTEM_FAULT: FoodContext');
                console.error('System failed to fetch primary data collections.');
                console.error('Fault details:', err);
                console.groupEnd();
                setFoods([]);
                setPolls([]);
                setRestaurants([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const addFood = useCallback(async (food) => {
        try {
            const newFood = await foodsAPI.create(food);
            setFoods([...foods, newFood]);
        } catch {
            // fallback: optimistic update
            setFoods([...foods, { ...food, _id: Date.now().toString() }]);
        }
    }, [foods]);

    const updateFood = useCallback(async (id, updatedFood) => {
        try {
            const updated = await foodsAPI.update(id, updatedFood);
            setFoods(foods.map(f => (f._id || f.id) === id ? updated : f));
        } catch {
            // fallback: optimistic update
            setFoods(foods.map(f => (f._id || f.id) === id ? { ...f, ...updatedFood } : f));
        }
    }, [foods]);

    const deleteFood = useCallback(async (id) => {
        try {
            await foodsAPI.delete(id);
            setFoods(foods.filter(f => (f._id || f.id) !== id));
        } catch {
            // fallback: optimistic update
            setFoods(foods.filter(f => (f._id || f.id) !== id));
        }
    }, [foods]);

    const voteForPoll = useCallback(async (pollId, userId) => {
        try {
            const res = await pollsAPI.vote(pollId);
            setPolls(polls.map(p => (p._id || p.id) === pollId ? { 
                ...p, 
                votes: (p.votes || 0) + 1, 
                votedBy: res.voted 
                    ? [...(p.votedBy || []), userId] 
                    : (p.votedBy || []).filter(id => id !== userId)
            } : p));
        } catch {
            // fallback: optimistic update
            setPolls(polls.map(p => {
                if ((p._id || p.id) === pollId) {
                    if (p.votedBy?.includes(userId)) {
                        return { ...p, votes: Math.max(0, (p.votes || 0) - 1), votedBy: p.votedBy.filter(id => id !== userId) };
                    } else {
                        return { ...p, votes: (p.votes || 0) + 1, votedBy: [...(p.votedBy || []), userId] };
                    }
                }
                return p;
            }));
        }
    }, [polls]);

    const promoteToMenu = useCallback(async (pollId) => {
        const pollItem = polls.find(p => (p._id || p.id) === pollId);
        if (pollItem) {
            const newFood = { name: pollItem.name, price: pollItem.price, description: pollItem.description, image: pollItem.image, restaurant: 'Weekly Offer', category: 'veg' };
            await addFood(newFood);
            setPolls(polls.filter(p => (p._id || p.id) !== pollId));
        }
    }, [polls, addFood]);

    const isInWishlist = useCallback((foodId) => wishlist.some(f => (f._id || f.id) === foodId), [wishlist]);

    const toggleWishlist = useCallback(async (foodId) => {
        try {
            await usersAPI.toggleWishlist(foodId);
            setWishlist(prev => {
                const exists = prev.some(f => (f._id || f.id) === foodId);
                if (exists) return prev.filter(f => (f._id || f.id) !== foodId);
                const food = foods.find(f => (f._id || f.id) === foodId);
                return food ? [...prev, food] : prev;
            });
        } catch {
            // fallback: optimistic update
            setWishlist(prev => {
                const exists = prev.some(f => (f._id || f.id) === foodId);
                if (exists) return prev.filter(f => (f._id || f.id) !== foodId);
                const food = foods.find(f => (f._id || f.id) === foodId);
                return food ? [...prev, food] : prev;
            });
        }
    }, [foods]);

    // Load wishlist on mount
    useEffect(() => {
        const loadWishlist = async () => {
            try {
                const res = await usersAPI.getWishlist();
                setWishlist(res)
            } catch {
                // ignore if backend unavailable
            }
        };
        loadWishlist();
    }, []);

    const updateRestaurantStatus = useCallback(async (id, data) => {
        try {
            const updated = await restaurantsAPI.update(id, data);
            setRestaurants(restaurants.map(r => (r._id || r.id) === id ? updated : r));
        } catch (err) {
            console.error('Failed to update restaurant status:', err);
            // Optimistic fallback
            setRestaurants(restaurants.map(r => (r._id || r.id) === id ? { ...r, ...data } : r));
        }
    }, [restaurants]);

    const getHighestVotedItems = useCallback(() => {
        if (!Array.isArray(polls)) return [];
        
        // The polls array contains individual food items with votes
        // Sort by votes and return top items
        return polls
            .filter(poll => poll.votes > 0) // Only include items with votes
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 10) // Top 10 items
            .map(poll => ({
                ...poll,
                text: poll.name, // For display compatibility
                price: poll.price,
                image: poll.image,
                description: poll.description
            }));
    }, [polls]);

    const promoteHighestVotedToMenu = useCallback(() => {
        const highestVoted = getHighestVotedItems();
        const promotedItems = highestVoted.filter(item => item.votes >= 3); // Only promote items with 3+ votes
        
        promotedItems.forEach(item => {
            const existingFood = foods.find(f => f.name === item.name);
            if (!existingFood) {
                // Add to menu as new food item
                const newFood = {
                    name: item.name,
                    price: item.price || 150, // Default price
                    description: item.description || `Popular choice with ${item.votes} votes`,
                    image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
                    restaurant: item.restaurant || 'Popular Choice',
                    category: item.category || 'veg',
                    votes: item.votes,
                    source: 'voting'
                };
                addFood(newFood);
            }
        });
        
        return promotedItems.length;
    }, [getHighestVotedItems, foods, addFood]);

    return (
        <FoodContext.Provider value={{
            foods, addFood, updateFood, deleteFood,
            polls, voteForPoll, promoteToMenu,
            wishlist, toggleWishlist, isInWishlist,
            restaurants, updateRestaurantStatus,
            getHighestVotedItems, promoteHighestVotedToMenu,
            loading
        }}>
            {children}
        </FoodContext.Provider>
    );
};
