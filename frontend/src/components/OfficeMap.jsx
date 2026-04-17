import React, { useState } from 'react';
import './OfficeMap.css';

const OfficeMap = ({ onSelect, selectedDesk }) => {
    // Generate a simple 5x8 grid of desks
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const cols = [1, 2, 3, 4, 5, 6, 7, 8];

    const desks = [];
    rows.forEach(r => {
        cols.forEach(c => {
            desks.push(`${r}${c}`);
        });
    });

    // Mock reserved desks
    const reserved = ['A1', 'B3', 'C7', 'E2', 'D4'];

    return (
        <div className="office-map-container glass">
            <div className="map-header">
                <h3>Select Your Desk</h3>
                <p>Click your current seat for precise delivery</p>
            </div>

            <div className="office-grid">
                {desks.map(desk => {
                    const isReserved = reserved.includes(desk);
                    const isSelected = selectedDesk === desk;
                    
                    return (
                        <div 
                            key={desk} 
                            className={`desk-item ${isReserved ? 'reserved' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isReserved && onSelect(desk)}
                        >
                            <div className="desk-icon"></div>
                            <span className="desk-label">{desk}</span>
                            {isSelected && <div className="selection-pulse"></div>}
                        </div>
                    );
                })}
            </div>

            <div className="map-legend">
                <div className="legend-item">
                    <div className="legend-box available"></div>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box reserved"></div>
                    <span>Occupied</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box selected"></div>
                    <span>Your Selection</span>
                </div>
            </div>
        </div>
    );
};

export default OfficeMap;
