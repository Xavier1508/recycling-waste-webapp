import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IoCaretBackCircle } from "react-icons/io5";
import { FaRegSadTear, FaMapSigns, FaCheckCircle } from "react-icons/fa";
import { driverAPI } from "@/services/api";

const HistoryDriver = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDriverHistory = async () => {
      setIsLoading(true);
      setError("");
      try {
        // DATA Dummy
        setTasks([
            { pickup_id: 101, user_name: 'Budi Santoso', pickup_address: 'Jl. Merdeka No. 1, Jakarta Pusat', requested_at: new Date().toISOString(), status: 'completed' },
            { pickup_id: 102, user_name: 'Citra Lestari', pickup_address: 'Jl. Pahlawan No. 22, Jakarta Barat', requested_at: new Date().toISOString(), status: 'assigned_to_driver' },
            { pickup_id: 103, user_name: 'Dewi Anggraini', pickup_address: 'Jl. Kebon Jeruk XV, Jakarta Barat', requested_at: new Date().toISOString(), status: 'cancelled_by_user' },
        ]);

      } catch (err) {
        console.error("Gagal mengambil riwayat tugas:", err);
        setError("Tidak dapat memuat riwayat tugas Anda.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled_by_user': return 'bg-red-100 text-red-700';
      case 'assigned_to_driver': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-start">
          <Link href="/driverprofile">
            <button className="bg-[#7c1215] text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#a03236] transition duration-300 text-sm sm:text-base">
              <IoCaretBackCircle className="text-2xl sm:text-3xl" /> <p>Kembali ke Profil</p>
            </button>
          </Link>
        </div>

        <div className="bg-[#e2bbbb] rounded-xl shadow-lg max-w-5xl p-5 mx-auto mb-8">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800">
            Riwayat Tugas Penjemputan
          </h2>
        </div>

        {isLoading && <p className="text-center text-gray-500 py-10">Memuat riwayat...</p>}
        {!isLoading && error && <p className="text-center text-red-500 py-10">{error}</p>}
        {!isLoading && !error && tasks.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <FaRegSadTear className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Anda belum memiliki riwayat tugas.</p>
          </div>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {tasks.map((task) => (
              <div key={task.pickup_id} className="bg-white rounded-xl shadow-lg p-5 transition-shadow hover:shadow-xl">
                <div className="sm:flex sm:items-start sm:gap-5">
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-0">
                            Tugas ID: #{task.pickup_id}
                        </h3>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusClass(task.status)}`}>
                            {task.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Tanggal Diminta: {formatDate(task.requested_at)}</p>
                    <p className="text-sm text-gray-600 mb-1">Customer: <span className="font-medium">{task.user_name}</span></p>
                    <p className="text-sm text-gray-600 mb-1">Alamat: <span className="font-medium">{task.pickup_address}</span></p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
                    {task.status === 'assigned_to_driver' && (
                        <>
                            <button className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1">
                                <FaMapSigns /> Navigasi
                            </button>
                             <button className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors flex items-center gap-1">
                                <FaCheckCircle /> Selesaikan
                            </button>
                        </>
                    )}
                     {task.status === 'completed' && (
                        <p className="text-sm font-semibold text-green-600">Tugas Selesai</p>
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

export default HistoryDriver;
