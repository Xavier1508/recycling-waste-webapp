import React, { useState, useEffect } from 'react'; // <-- PERBAIKAN: Menambahkan impor yang hilang
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/router';
import { PulseLoader } from 'react-spinners';
import { FaArrowAltCircleLeft } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// --- FUNGSI BARU: Membuat ikon peta dari foto profil USER ---
const createUserAvatarIcon = (imageUrl) => {
    // Gambar fallback jika user tidak punya foto profil
    const fallbackImageUrl = '/default-user.png'; 
    // Menggunakan URL lengkap jika ada, jika tidak, pakai fallback
    const finalImageUrl = imageUrl && imageUrl !== 'null' ? `${API_BASE_URL}${imageUrl}` : fallbackImageUrl;

    return L.divIcon({
        html: `<div style="width: 45px; height: 45px; border-radius: 50%; border: 4px solid #3b82f6; box-shadow: 0 4px 8px rgba(0,0,0,0.4); background-image: url(${finalImageUrl}); background-size: cover; background-position: center;"></div>`,
        className: 'map-avatar-icon',
        iconSize: [45, 45],
        iconAnchor: [22, 45] // Posisi pin
    });
};

const MapDisplay = () => {
    const router = useRouter();
    // Mengambil data lokasi (lat, lng) dan avatar dari URL yang dikirim oleh UserProfile
    const { lat, lng, avatar } = router.query;

    const [userPosition, setUserPosition] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hanya proses jika data dari URL sudah siap
        if (lat && lng) {
            // Konversi string dari URL menjadi angka
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);

            // Pastikan hasil konversi valid sebelum di-set ke state
            if (!isNaN(latitude) && !isNaN(longitude)) {
                setUserPosition([latitude, longitude]);
            }
        }
        setIsLoading(false); // Selesai loading
    }, [lat, lng]); // Efek ini akan berjalan setiap kali data lat/lng dari URL berubah

    // Tampilkan loader jika masih memproses
    if (isLoading) {
        return <div className="h-screen flex justify-center items-center"><PulseLoader color="#D93D41" /></div>;
    }

    // Tampilkan pesan error jika data lokasi tidak valid setelah diproses
    if (!userPosition) {
        return (
             <div className="h-screen flex flex-col justify-center items-center text-center p-4">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Gagal Menampilkan Peta</h2>
                <p className="text-gray-500 mb-6">Data lokasi Anda tidak valid atau tidak ditemukan.</p>
                 <button onClick={() => router.back()} className="text-[#7c1215] font-semibold flex items-center text-sm hover:text-[#a03236] transition-colors">
                    <FaArrowAltCircleLeft className="mr-2 text-3xl" /> <p className="text-base">Kembali ke Profil</p>
                </button>
            </div>
        );
    }
    
    // Tampilkan peta jika semua data sudah siap
    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto mb-4 flex justify-between items-center">
                 <button onClick={() => router.back()} className="text-[#7c1215] font-semibold flex items-center text-sm hover:text-[#a03236] transition-colors z-20">
                    <FaArrowAltCircleLeft className="mr-2 text-3xl" /> <p className="text-base">Kembali</p>
                </button>
                <h2 className="text-xl font-bold text-gray-700">Peta Lokasi Anda</h2>
            </div>
            <div className='max-w-7xl mx-auto shadow-lg rounded-xl overflow-hidden'>
                <MapContainer center={userPosition} zoom={16} scrollWheelZoom={true} style={{ height: '80vh', width: '100%', zIndex: 10 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={userPosition} icon={createUserAvatarIcon(avatar)}>
                        <Popup>Lokasi Anda</Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

export default MapDisplay;
