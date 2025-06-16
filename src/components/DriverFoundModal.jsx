import React, { useEffect } from 'react';
import Link from 'next/link';
import { FaTruck, FaMapMarkedAlt, FaStar, FaPhoneAlt, FaTimes } from 'react-icons/fa';
import { MdFormatListNumbered } from "react-icons/md";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Komponen Modal Notifikasi "Driver Ditemukan"
const DriverFoundModal = ({ pickupData, onClose }) => {

    // Efek untuk menutup modal secara otomatis setelah 15 detik
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 15000); // 15000 milidetik = 15 detik

        // Cleanup timer jika komponen di-unmount atau onClose dipanggil lebih dulu
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!pickupData || !pickupData.driver) {
        return null;
    }

    const { driver, pickupId } = pickupData;

    // Fungsi untuk memformat tipe kendaraan
    const formatVehicleType = (type) => {
        const vehicleMap = {
            'motorcycle_box': 'Motor Roda Tiga',
            'small_truck': 'Truk Kecil (Pick-up)',
            'medium_truck': 'Truk Sedang',
            'bicycle_cart': 'Gerobak Sepeda'
        };
        return vehicleMap[type] || type;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fade-in-fast">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out scale-100 p-6 relative">
                
                {/* Tombol Close di pojok kanan atas */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Tutup notifikasi"
                >
                    <FaTimes size={20} />
                </button>

                {/* Header Modal */}
                <div className="text-center mb-4">
                    <img 
                        src={driver.profile_picture_url ? `${API_BASE_URL}${driver.profile_picture_url}` : '/default-driver.png'} 
                        alt="Foto Profil Driver" 
                        className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-400 shadow-md"
                        onError={(e) => { e.target.onerror = null; e.target.src='/default-driver.png'; }}
                    />
                    <h2 className="text-2xl font-bold text-gray-800 mt-3">Driver Ditemukan!</h2>
                </div>

                {/* Detail Informasi Driver */}
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex-grow">{driver.driver_name || 'Nama Driver'}</h3>
                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full">
                            <FaStar />
                            <span className="font-bold text-gray-800">{Number(driver.rating_average || 0).toFixed(1)}</span>
                        </div>
                    </div>
                    <div className="border-t pt-3">
                        <div className="flex items-center text-gray-600 mb-2">
                            <FaPhoneAlt className="mr-3 text-gray-400" />
                            <span>{driver.phone_number || 'No. Telepon'}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                            <FaTruck className="mr-3 text-gray-400" />
                            <span>{formatVehicleType(driver.vehicle_type)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MdFormatListNumbered className="mr-3 text-gray-400" />
                            <span>{driver.license_plate || 'Plat Nomor'}</span>
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-6">
                    <Link href={`/track/${pickupId}`} legacyBehavior>
                        <a 
                            onClick={onClose}
                            className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                        >
                            <FaMapMarkedAlt /> Lacak Perjalanan
                        </a>
                    </Link>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default DriverFoundModal;