import React from 'react';
import Link from 'next/link';
import { usePickup } from '@/context/PickupContext';
import { FaTruck, FaMapMarkedAlt } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const ActivePickupBanner = () => {
  const { activePickup } = usePickup();

  if (!activePickup) return null;

  const isSearching = activePickup.status === 'searching';
  
  // --- Ambil pesan status dinamis dari context ---
  const statusMessage = activePickup.status_message;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99] p-3 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-gray-800 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {isSearching ? (
            <PulseLoader color="#f3f3f3" size={8} />
          ) : (
            <FaTruck className="text-xl sm:text-2xl text-green-400 animate-pulse flex-shrink-0" />
          )}
          <div className="min-w-0">
            {/* Tampilkan status dinamis jika ada, jika tidak, tampilkan pesan default */}
            <p className="font-bold text-sm truncate">
              {statusMessage || (isSearching ? "Mencari Driver Terdekat..." : "Driver Ditemukan!")}
            </p>
            {!isSearching && (
              <p className="text-xs opacity-80 truncate">
                Driver: {activePickup.driver?.driver_name || 'Dalam Perjalanan'}
              </p>
            )}
          </div>
        </div>
        {!isSearching && activePickup.pickupId && (
          <Link href={`/track/${activePickup.pickupId}`} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2 flex-shrink-0">
            <FaMapMarkedAlt /> Lacak
          </Link>
        )}
      </div>
      <style jsx>{`
        @keyframes slide-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ActivePickupBanner;
