import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { socket } from '@/lib/socket';
import { FaUser, FaTruck, FaWarehouse } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const tpaIcon = new L.Icon({ 
    iconUrl: '/tpa-marker.png', 
    iconSize: [35, 35], 
    iconAnchor: [17, 35] 
});

const MapTracking = ({ details }) => {
    const [driverPosition, setDriverPosition] = useState(null);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
            console.log('[MapTracking] Force connect.');
        }

        if (details?.driver_latitude && details?.driver_longitude) {
            setDriverPosition([details.driver_latitude, details.driver_longitude]);
        }

        const handleLocationUpdate = (updatedDriver) => {
            if (updatedDriver.driver_id === details.assigned_driver_id) {
                setDriverPosition([updatedDriver.current_latitude, updatedDriver.current_longitude]);
            }
        };

        socket.on('driver-location-broadcast', handleLocationUpdate);
        console.log('[MapTracking] Listener "driver-location-broadcast" is ON.');

        return () => {
            socket.off('driver-location-broadcast', handleLocationUpdate);
            console.log('[MapTracking] Listener "driver-location-broadcast" is OFF.');
        };
    }, [details]);

    if (!details || typeof details.customer_latitude !== 'number' || typeof details.customer_longitude !== 'number') {
        return <div className='h-96 flex justify-center items-center text-gray-500'>Data lokasi customer tidak valid untuk ditampilkan.</div>;
    }

    const userPosition = [details.customer_latitude, details.customer_longitude];
    const tpaPosition = (typeof details.tpa_latitude === 'number' && typeof details.tpa_longitude === 'number') ? [details.tpa_latitude, details.tpa_longitude] : null;
    const currentDriverPos = (driverPosition && typeof driverPosition[0] === 'number') ? driverPosition : null;

    const createAvatarIcon = (imageUrl, role = 'user') => {
        const borderColor = role === 'driver' ? '#22c55e' : '#3b82f6';
        const fallbackImageUrl = role === 'driver' ? '/default-driver.png' : '/default-user.png';
        const finalImageUrl = imageUrl ? `${API_BASE_URL}${imageUrl}` : fallbackImageUrl;

        return L.divIcon({
            html: `<div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid ${borderColor}; box-shadow: 0 2px 5px rgba(0,0,0,0.3); background-image: url(${finalImageUrl}); background-size: cover; background-position: center;"></div>`,
            className: 'map-avatar-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });
    };

    return (
        <div className='shadow-lg rounded-xl overflow-hidden'>
            <MapContainer center={currentDriverPos || userPosition} zoom={14} style={{ height: '75vh', width: '100%', zIndex: 10 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {userPosition && (
                    <Marker position={userPosition} icon={createAvatarIcon(details.customer_profile_url, 'user')}>
                        <Popup>Lokasi Anda: {details.customer_name}</Popup>
                    </Marker>
                )}
                
                {currentDriverPos && (
                    <Marker position={currentDriverPos} icon={createAvatarIcon(details.driver_profile_url, 'driver')}>
                        <Popup>Driver: {details.driver_name}</Popup>
                    </Marker>
                )}
                
                {tpaPosition && (
                    <Marker position={tpaPosition} icon={tpaIcon}>
                        <Popup>TPA: {details.tpa_name}</Popup>
                    </Marker>
                )}

                {currentDriverPos && userPosition && (
                    <Polyline positions={[currentDriverPos, userPosition]} color="#3b82f6" dashArray="5, 10" />
                )}
                {userPosition && tpaPosition && (
                    <Polyline positions={[userPosition, tpaPosition]} color="#16a34a" />
                )}
            </MapContainer>
        </div>
    );
};

export default MapTracking;