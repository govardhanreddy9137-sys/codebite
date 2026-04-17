import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Secure Tactical Icons for Elite Dispatch
const kitchenIcon = L.divIcon({
    className: 'tactical-marker',
    html: `<div style="background: #3b82f6; color: white; width: 40px; height: 40px; border-radius: 12px; display: flex; alignItems: center; justifyContent: center; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); border: 2px solid white;">🍳</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const customerIcon = L.divIcon({
    className: 'tactical-marker',
    html: `<div style="background: #ef4444; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); border: 2px solid white;">🏠</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const riderIcon = L.divIcon({
    className: 'tactical-marker-rider',
    html: `<div style="background: white; color: #ff3008; width: 48px; height: 48px; border-radius: 15px; display: flex; alignItems: center; justifyContent: center; box-shadow: 0 0 30px rgba(255,255,255,0.4); border: 3px solid #ff3008; animation: success-pulse 2s infinite;">🏍️</div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
});

const OrderMap = ({ orders, riderLocation = null, customerLocation = [12.9716, 77.5946], restaurantLocation = [12.9516, 77.5746] }) => {
  const [mapKey, setMapKey] = useState(Date.now());

  useEffect(() => {
    setMapKey(Date.now());
  }, [orders, riderLocation]);

  const centerPosition = riderLocation || restaurantLocation || customerLocation || [12.9716, 77.5946];

  return (
    <div className="map-container" style={{ height: '100%', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>
      <MapContainer
        key={mapKey}
        center={centerPosition}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Restaurant Marker */}
        <Marker position={restaurantLocation}>
          <Popup>Restaurant Location</Popup>
        </Marker>

        {/* Customer Marker */}
        <Marker position={customerLocation}>
          <Popup>Delivery Location</Popup>
        </Marker>

        {/* Rider Marker */}
        {riderLocation && (
          <Marker position={riderLocation}>
            <Popup>Rider is here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default OrderMap;
