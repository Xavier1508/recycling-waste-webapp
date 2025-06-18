import React from 'react';
import { FaMapMarkerAlt, FaRoute } from 'react-icons/fa';

const OfferNotificationModal = ({ offer, onAccept, onDecline }) => {
    if (!offer) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-pulse-once">
                <h3 className="text-lg font-bold text-gray-800">Tawaran Pekerjaan Baru!</h3>
                <p className="text-sm text-gray-500 mb-4">Anda mendapatkan permintaan penjemputan.</p>
                
                <div className="border-t border-b py-3 my-3 space-y-2">
                    <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="font-semibold text-gray-700">{offer.user_name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Alamat</p>
                        <p className="font-semibold text-gray-700 flex items-start gap-2"><FaMapMarkerAlt className="mt-1 text-gray-400 flex-shrink-0" /> {offer.user_address}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Estimasi Jarak</p>
                        <p className="font-semibold text-gray-700 flex items-center gap-2"><FaRoute className="text-gray-400" /> {Number(offer.distance).toFixed(2)} km dari lokasi Anda</p>
                    </div>
                </div>

                <div className="flex justify-between gap-3">
                    <button 
                        onClick={onDecline}
                        className="w-1/2 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Tolak
                    </button>
                    <button 
                        onClick={onAccept}
                        className="w-1/2 bg-green-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                        Terima
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfferNotificationModal;