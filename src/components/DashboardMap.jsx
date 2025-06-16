// File: components/DashboardMap.jsx (File Baru)

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Ikon-ikon Peta
const driverIcon = new L.Icon({ iconUrl: '/driver-icon.png', iconSize: [35, 35], iconAnchor: [17, 35] });
const userIcon = new L.Icon({ iconUrl: '/user-marker.png', iconSize: [35, 35], iconAnchor: [17, 35] });
const tpaIcon = new L.Icon({ iconUrl: '/tpa-marker.png', iconSize: [35, 35], iconAnchor: [17, 35] });

const DashboardMap = ({ driverData, activeTask }) => {
    // Menentukan posisi default jika tidak ada data lain (fallback ke Jakarta)
    const defaultPosition = [-6.2088, 106.8456];
    
    // Posisi driver saat ini
    const driverPosition = driverData?.current_latitude && driverData?.current_longitude
        ? [driverData.current_latitude, driverData.current_longitude]
        : null;

    // Posisi customer dari tugas aktif
    const customerPosition = activeTask?.customer_latitude && activeTask?.customer_longitude
        ? [activeTask.customer_latitude, activeTask.customer_longitude]
        : null;

    // Posisi TPA dari tugas aktif
    const tpaPosition = activeTask?.tpa_latitude && activeTask?.tpa_longitude
        ? [activeTask.tpa_latitude, activeTask.tpa_longitude]
        : null;

    // Menentukan pusat peta: prioritaskan posisi driver, lalu customer, atau default
    const mapCenter = driverPosition || customerPosition || defaultPosition;
    
    // Menentukan level zoom peta: lebih dekat jika ada tugas aktif
    const mapZoom = activeTask ? 13 : 14;

    return (
        <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden min-h-[250px] shadow-inner">
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={false} dragging={!!activeTask}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Tampilkan marker driver */}
                {driverPosition && (
                    <Marker position={driverPosition} icon={driverIcon}>
                        <Popup>Lokasi Anda Saat Ini</Popup>
                    </Marker>
                )}

                {/* Tampilkan marker dan rute hanya jika ada tugas aktif */}
                {activeTask && (
                    <>
                        {customerPosition && (
                            <Marker position={customerPosition} icon={userIcon}>
                                <Popup>Lokasi Customer: {activeTask.customer_name}</Popup>
                            </Marker>
                        )}
                        {tpaPosition && (
                            <Marker position={tpaPosition} icon={tpaIcon}>
                                <Popup>Tujuan TPA: {activeTask.tpa_name}</Popup>
                            </Marker>
                        )}
                        {/* Garis rute */}
                        {driverPosition && customerPosition && <Polyline positions={[driverPosition, customerPosition]} color="#3b82f6" dashArray="5, 10" />}
                        {customerPosition && tpaPosition && <Polyline positions={[customerPosition, tpaPosition]} color="#16a34a" />}
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default DashboardMap;