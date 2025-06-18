import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IoCaretBackCircle, IoAlertCircleOutline } from "react-icons/io5";
import { FaRegSadTear, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import { pickupAPI } from "@/services/api";
import AuthPromptModal from './AuthPromptModal';
import { useRouter } from "next/router";

const placeholderPickupImage = "https://placehold.co/100x100/e2bbbb/7c1215?text=Pickup";

const History = () => {
  const [pickupHistory, setPickupHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      fetchHistory();
    } else {
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await pickupAPI.getHistory();
      setPickupHistory(response.data || []);
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
      setError("Tidak dapat memuat riwayat penjemputan.");
       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         setIsAuthModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPickup = async (pickupId) => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan permintaan penjemputan ini?")) {
      try {
        await pickupAPI.cancelPickup(pickupId);
        alert("Permintaan penjemputan berhasil dibatalkan.");
        fetchHistory();
      } catch (err) {
        console.error("Gagal membatalkan penjemputan:", err);
        alert(err.response?.data?.error || "Gagal membatalkan penjemputan.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'picked_up': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'requested': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  if (!isLoggedIn && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 flex flex-col items-center justify-center">
          <AuthPromptModal isOpen={true} onClose={() => router.push('/')} title="Akses Riwayat" message="Silakan login untuk melihat riwayat penjemputan Anda." />
          {/* Fallback jika modal tidak tampil */}
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <IoAlertCircleOutline className="text-5xl text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Anda harus login untuk melihat riwayat.</p>
            <button onClick={() => router.push('/login')} className="bg-[#d93d41] text-white py-2 px-5 rounded-lg font-semibold hover:bg-[#b92d31]">
                Login Sekarang
            </button>
          </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-10">
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => {setIsAuthModalOpen(false); router.push('/login');}} />
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-start">
          <Link href={"/userprofile"}>
            <button className="bg-[#7c1215] text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#a03236] transition duration-300 text-sm sm:text-base">
              <IoCaretBackCircle className="text-2xl sm:text-3xl" /> <p>Kembali ke Profil</p>
            </button>
          </Link>
        </div>

        <div className="bg-[#e2bbbb] rounded-xl shadow-lg max-w-5xl p-5 mx-auto mb-8">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800">
            Riwayat Penjemputan Sampah Anda
          </h2>
        </div>

        {isLoading && <p className="text-center text-gray-500 py-10">Memuat riwayat...</p>}
        {!isLoading && error && <p className="text-center text-red-500 py-10">{error}</p>}
        {!isLoading && !error && pickupHistory.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <FaRegSadTear className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Anda belum memiliki riwayat penjemputan.</p>
            <Link href="/pickup">
              <button className="mt-4 bg-[#d93d41] text-white py-2 px-5 rounded-lg font-semibold hover:bg-[#b92d31] transition-colors">
                Atur Penjemputan Pertama Anda
              </button>
            </Link>
          </div>
        )}

        {!isLoading && !error && pickupHistory.length > 0 && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {pickupHistory.map((item) => (
              <div key={item.pickup_id} className="bg-white rounded-xl shadow-lg p-5 transition-shadow hover:shadow-xl">
                <div className="sm:flex sm:items-start sm:gap-5">
                  <Image
                    src={item.image_url || placeholderPickupImage}
                    alt={`Penjemputan ${item.pickup_id}`}
                    width={100}
                    height={100}
                    className="w-full sm:w-24 h-32 sm:h-24 rounded-lg object-cover mb-4 sm:mb-0 flex-shrink-0"
                    onError={(e) => e.target.src = placeholderPickupImage}
                  />
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-0">
                            ID Penjemputan: #{item.pickup_id}
                        </h3>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusClass(item.status)}`}>
                            {item.status || 'Tidak Diketahui'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Tanggal Diminta: {formatDate(item.requested_at)}</p>
                    <p className="text-sm text-gray-600 mb-1">Alamat: <span className="font-medium">{item.pickup_address}</span></p>
                    {item.pickup_date && (
                         <p className="text-sm text-gray-600 mb-1">Jadwal Penjemputan: {formatDate(item.pickup_time || item.pickup_date)}</p>
                    )}
                    {item.items_detail && (
                        <p className="text-sm text-gray-600 mb-2">Detail Item: <span className="italic">{item.items_detail}</span></p>
                    )}
                     <p className="text-sm text-gray-600">Total Berat: <span className="font-medium">{item.total_weight_kg || 0} kg</span></p>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:text-right flex-shrink-0">
                    <p className="text-lg font-bold text-green-600">+{item.total_points_earned || 0} Poin</p>
                    {item.status?.toLowerCase() === 'requested' && (
                      <button
                        onClick={() => handleCancelPickup(item.pickup_id)}
                        className="mt-2 text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
                      >
                        <FaTrashAlt /> Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
