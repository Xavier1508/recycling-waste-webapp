import React from 'react';
import { PulseLoader } from 'react-spinners';
import { FaUser, FaPhone, FaTruck } from 'react-icons/fa';

const PickupStatusModal = ({ status, driverInfo, onClose }) => {
    if (status === 'idle') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 transform transition-all">
                {status === 'searching' && (
                    <div className="flex items-center justify-center gap-4">
                        <PulseLoader color="#D93D41" size={10} />
                        <p className="font-semibold text-gray-700">Sedang mencari driver terdekat untuk Anda...</p>
                    </div>
                )}
                {status === 'driver_found' && driverInfo && (
                    <div>
                        <h3 className="text-lg font-bold text-green-600 mb-3">Driver Ditemukan!</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2"><FaUser className="text-gray-500" /> <span className="font-semibold">{driverInfo.driver_name}</span></div>
                            <div className="flex items-center gap-2"><FaPhone className="text-gray-500" /> <span>{driverInfo.phone_number}</span></div>
                            <div className="flex items-center gap-2"><FaTruck className="text-gray-500" /> <span>{driverInfo.license_plate}</span></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Driver sedang dalam perjalanan. Anda bisa melacaknya di halaman Peta.</p>
                        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PickupStatusModal;