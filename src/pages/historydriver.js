import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { driverAPI } from "@/services/api";
import { FaUserCircle, FaMapMarkedAlt, FaHistory, FaBell, FaStar } from "react-icons/fa";
import { MdLogout, MdLocationOn } from "react-icons/md";
import { PulseLoader } from "react-spinners";

const MapPlaceholder = () => (
    <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 font-semibold">Map Area (Integrasi Peta di sini)</p>
    </div>
);

const DriverProfile = () => {
    const [driverData, setDriverData] = useState(null);
    const [driverStats, setDriverStats] = useState({
        tasksToday: 3,
        tasksCompleted: 125,
        totalDistance: "340 km"
    });
    const [isOnline, setIsOnline] = useState(true);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

    useEffect(() => {
        const fetchDriverData = async () => {
            setIsLoading(true);
            try {
                const localData = JSON.parse(localStorage.getItem("userData"));
                setDriverData(localData);
            } catch (err) {
                console.error("Gagal mengambil data driver:", err);
                setError("Gagal memuat data profil Anda.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDriverData();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new CustomEvent("authChange"));
        router.push("/login");
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen pt-20 bg-gray-100"><PulseLoader color="#D93D41" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header Driver */}
            <div className="bg-gradient-to-b from-[#000000] to-[#7c1215] p-6 pt-32 flex flex-wrap gap-4 justify-between items-center text-white rounded-b-xl shadow-md">
                <div>
                    <p className="text-sm ml-2">Selamat Bekerja,</p>
                    <h1 className="text-2xl font-bold ml-3">{driverData?.first_name} {driverData?.last_name}</h1>
                </div>
                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-full">
                    <span className={`font-semibold text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                    <label htmlFor="statusToggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="statusToggle" className="sr-only peer" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
                        <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Tugas Hari Ini */}
                <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Hari Ini</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700 font-semibold">Tugas Masuk Hari Ini</p>
                            <p className="text-3xl font-bold text-blue-900">5</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700 font-semibold">Tugas Selesai</p>
                            <p className="text-3xl font-bold text-green-900">{driverStats.tasksToday}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-700 font-semibold">Menunggu Konfirmasi</p>
                            <p className="text-3xl font-bold text-yellow-900">2</p>
                        </div>
                    </div>
                </div>

                {/* Kolom Tengah: Peta dan Navigasi */}
                <div className="lg:col-span-1 space-y-6">
                     <div className="p-4 grid grid-cols-3 gap-3 text-center bg-white rounded-xl shadow-lg">
                        <Link href="/historydriver" className="block hover:scale-105 transition-transform group">
                            <div className="flex flex-col items-center justify-center bg-[#f0e2e2] hover:bg-[#e2bbbb] w-full h-24 rounded-lg py-2 shadow-inner transition-colors">
                                <FaHistory className="text-3xl text-[#7c1215]" />
                                <span className="text-xs mt-1.5 text-[#7c1215] font-medium">Riwayat</span>
                            </div>
                        </Link>
                         <button className="block hover:scale-105 transition-transform group">
                            <div className="flex flex-col items-center justify-center bg-[#f0e2e2] hover:bg-[#e2bbbb] w-full h-24 rounded-lg py-2 shadow-inner transition-colors">
                                <FaBell className="text-3xl text-[#7c1215]" />
                                <span className="text-xs mt-1.5 text-[#7c1215] font-medium">Notifikasi</span>
                            </div>
                        </button>
                         <button className="block hover:scale-105 transition-transform group">
                            <div className="flex flex-col items-center justify-center bg-[#f0e2e2] hover:bg-[#e2bbbb] w-full h-24 rounded-lg py-2 shadow-inner transition-colors">
                                <FaMapMarkedAlt className="text-3xl text-[#7c1215]" />
                                <span className="text-xs mt-1.5 text-[#7c1215] font-medium">Lihat Peta</span>
                            </div>
                        </button>
                    </div>
                    <MapPlaceholder />
                </div>

                {/* Kolom Kanan: Detail Profil Driver */}
                <div className="bg-white rounded-xl shadow-md p-6 text-gray-700 space-y-4">
                    <div className="flex flex-col items-center">
                        {driverData?.profile_picture_url ? (
                            <img src={`${API_BASE_URL}${driverData.profile_picture_url}`} alt="Foto Profil" className="w-28 h-28 rounded-full object-cover border-4 border-red-200 shadow-md" />
                        ) : (
                            <FaUserCircle className="w-28 h-28 text-red-400" />
                        )}
                        <h2 className="text-xl font-semibold text-center mt-3">{driverData?.first_name} {driverData?.last_name}</h2>
                        <p className="text-sm text-gray-500">{driverData?.driver_code}</p>
                        <div className="flex items-center gap-1 text-yellow-500 mt-2">
                            <FaStar />
                            <span className="font-bold text-gray-700">4.9</span>
                            <span className="text-xs text-gray-500">({driverStats.tasksCompleted} tugas)</span>
                        </div>
                    </div>
                    <div className="border-t pt-4 space-y-3 text-sm">
                        <div>
                            <label className="font-medium text-gray-500">Email:</label>
                            <p className="text-gray-800">{driverData?.email}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-500">Telepon:</label>
                            <p className="text-gray-800">{driverData?.phone_number}</p>
                        </div>
                        <div>
                            <label className="font-medium text-gray-500">Area Operasi:</label>
                            <p className="text-gray-800">Jakarta Barat, Jakarta Pusat</p>
                        </div>
                         <div>
                            <label className="font-medium text-gray-500">Kendaraan:</label>
                            <p className="text-gray-800">Motor Roda Tiga (B 1234 XYZ)</p>
                        </div>
                    </div>
                     <div className="mt-4 flex justify-end">
                         <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm">
                            Edit Profil
                         </button>
                     </div>
                </div>
            </div>
            
            <div className="max-w-5xl mx-auto p-4 md:px-6 mt-8 mb-8">
                <button onClick={handleLogout} className="w-full max-w-sm mx-auto bg-red-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 text-lg shadow-md">
                    <MdLogout className="text-xl" /> Log Out
                </button>
            </div>
        </div>
    );
};

export default DriverProfile;
