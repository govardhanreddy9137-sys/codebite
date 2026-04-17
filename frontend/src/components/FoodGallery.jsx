import React, { useState, useEffect, useMemo } from 'react';
import { useFood } from '../context/FoodContext';
import './FoodGallery.css';
import { ChevronLeft, ChevronRight, Camera, Star, Users } from 'lucide-react';

const FoodGallery = () => {
    const { foods, loading } = useFood();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const galleryItems = useMemo(() => {
        if (!Array.isArray(foods) || foods.length === 0) {
            return [
                { id: 1, title: "Masala Dosa", chef: "Amma Chetti Vanta", rating: 4.9, views: "1.2k", image: "/images/masala dosa.jpg", tag: "Bestseller" },
                { id: 2, title: "Royal Biryani", chef: "Andhra Meals", rating: 4.8, views: "2.5k", image: "/images/chicken biryani.webp", tag: "Must Try" }
            ];
        }
        // Take 6 random or trending items
        return foods.slice(0, 6).map((f, i) => ({
            id: f._id || f.id,
            title: f.name,
            chef: f.restaurant || "CodeBite Kitchen",
            rating: 4.5 + (Math.random() * 0.5),
            views: `${Math.floor(Math.random() * 2000) + 500}`,
            image: f.image && (f.image.startsWith('http') || f.image.startsWith('/')) ? f.image : `/${f.image}`,
            tag: i === 0 ? "Bestseller" : i === 1 ? "Chef Recommended" : "Trending"
        }));
    }, [foods]);

    useEffect(() => {
        if (isHovered || galleryItems.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % galleryItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isHovered, galleryItems.length]);

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

    return (
        <div 
            className="food-gallery-container glass"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="gallery-header">
                <div className="gallery-title-group">
                    <Camera className="text-primary" size={24} />
                    <div>
                        <h3>Food Spotlight</h3>
                        <p>Beautiful moments from our kitchen & community</p>
                    </div>
                </div>
                <div className="gallery-nav">
                    <button onClick={handlePrev} className="nav-btn"><ChevronLeft size={20} /></button>
                    <button onClick={handleNext} className="nav-btn"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="gallery-viewport">
                {galleryItems.map((item, index) => (
                    <div 
                        key={item.id} 
                        className={`gallery-slide ${index === activeIndex ? 'active' : ''}`}
                    >
                        <div className="slide-image-wrapper">
                            <img src={item.image} alt={item.title} />
                            <div className="slide-overlay">
                                <span className="slide-tag">{item.tag}</span>
                                <div className="slide-content">
                                    <div className="slide-info">
                                        <h4>{item.title}</h4>
                                        <p>by {item.chef}</p>
                                    </div>
                                    <div className="slide-stats">
                                        <span className="stat"><Star size={14} fill="currentColor" /> {item.rating}</span>
                                        <span className="stat"><Users size={14} /> {item.views}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="gallery-indicators">
                {galleryItems.map((_, index) => (
                    <div 
                        key={index} 
                        className={`indicator ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => setActiveIndex(index)}
                    />
                ))}
            </div>
            
            <div className="gallery-footer">
                <p>Have a great photo of your meal? <span className="text-primary cursor-pointer">Upload & get 50 BitePoints!</span></p>
            </div>
        </div>
    );
};

export default FoodGallery;
