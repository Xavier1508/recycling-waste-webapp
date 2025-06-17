import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { driverAPI, offerAPI, pickupAPI } from "@/services/api";
import { socket } from "@/lib/socket";
import { FaUserCircle, FaMapMarkedAlt, FaHistory, FaBell, FaStar, FaWallet, FaHeadset, FaQuestionCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { PulseLoader } from "react-spinners";
import OfferNotificationModal from './OfferNotificationModal';

const MapPlaceholder = () => (
    <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500 font-semibold">Area Peta (Integrasi di sini)</p>
    </div>
);

const formatVehicleType = (type) => {
    if (!type) return 'N/A';
    const vehicleMap = {
        'motorcycle_box': 'Motor Roda Tiga (Box)',
        'small_truck': 'Truk Kecil (Pick-up)',
        'medium_truck': 'Truk Sedang',
        'bicycle_cart': 'Gerobak Sepeda'
    };
    return vehicleMap[type] || type;
};

const ActiveTaskCard = ({ task, onComplete }) => {
    if (!task) return null;
    return (
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-yellow-800">Tugas Aktif: Penjemputan #{task.pickup_id}</h2>
            <p className="text-gray-600 mt-2">Anda sedang dalam perjalanan untuk menjemput sampah di:</p>
            <p className="font-semibold text-gray-800 my-1">{task.pickup_address_text}</p>
            <div className="mt-4 flex flex-wrap gap-4">
                 <Link href={`/track/${task.pickup_id}`} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                     Lihat Rute di Peta
                 </Link>
                 <button 
                     onClick={() => onComplete(task.pickup_id)} 
                     className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                 >
                     Selesaikan Tugas
                 </button>
            </div>
        </div>
    );
};

const DriverProfile = () => {
    const [driverData, setDriverData] = useState(null);
    const [driverStats, setDriverStats] = useState({ tasks_today: 0, tasks_completed: 0, tasks_pending_confirmation: 0 });
    const [isOnline, setIsOnline] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const router = useRouter();
    const locationIntervalRef = useRef(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

    useEffect(() => {
        const fetchAndConnect = async () => {
            setIsLoading(true);
            try {
                const [profileRes, statsRes, historyRes] = await Promise.all([
                    driverAPI.getProfile(), 
                    driverAPI.getStats(),
                    driverAPI.getHistory()
                ]);

                const profileData = profileRes.data;
                setDriverData(profileData);
                setDriverStats(statsRes.data);
                setIsOnline(profileData.availability_status === 'available');

                const currentTask = historyRes.data.find(task => ['assigned_to_driver', 'driver_en_route', 'in_transit_to_tpa'].includes(task.status));
                setActiveTask(currentTask);

                socket.io.opts.query = { driverId: profileData.driver_id };
                socket.connect();

                socket.on('new_pickup_offer', (offerDetails) => {
                    console.log("Menerima tawaran baru:", offerDetails);
                    setCurrentOffer(offerDetails);
                });

            } catch (err) {
                console.error("Gagal mengambil data atau koneksi:", err);
                setError("Gagal memuat data profil Anda. Silakan coba lagi.");
                if (err.response?.status === 401 || err.response?.status === 403) {
                   router.push('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndConnect();

        return () => {
            socket.off('new_pickup_offer');
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [router]);

    useEffect(() => {
        if (isOnline && driverData) {
            locationIntervalRef.current = setInterval(() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => socket.emit('driver-location-update', { 
                        driverId: driverData.driver_id, 
                        latitude: position.coords.latitude, 
                        longitude: position.coords.longitude 
                    }),
                    (err) => console.warn("GPS Error:", err.message),
                    { enableHighAccuracy: true }
                );
            }, 15000);
        }
        return () => {
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
        };
    }, [isOnline, driverData]);

    const handleStatusToggle = async (newStatus) => {
        setIsOnline(newStatus);
        try {
            await driverAPI.updateStatus({ availability_status: newStatus ? 'available' : 'offline' });
            setDriverData(prev => ({...prev, availability_status: newStatus ? 'available' : 'offline'}));
        } catch (err) {
            console.error("Gagal update status:", err);
            setIsOnline(!newStatus);
            alert("Gagal mengubah status. Periksa koneksi Anda.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new CustomEvent("authChange"));
        router.push("/login");
    };

    const handleAcceptOffer = async () => {
        if (!currentOffer) return;
        try {
            const response = await offerAPI.accept(currentOffer.offer_id); 
            alert(response.data.message);
            setCurrentOffer(null);
            
            window.location.reload();
        } catch (err) {
            console.error("Gagal menerima tawaran:", err);
            alert(err.response?.data?.error || "Gagal menerima tawaran.");
            setCurrentOffer(null);
        }
    };
    
    const handleDeclineOffer = async () => {
        if (!currentOffer) return;
        try {
            const response = await offerAPI.decline(currentOffer.offer_id);
            alert(response.data.message);
            setCurrentOffer(null);
        } catch (err) {
            console.error("Gagal menolak tawaran:", err);
            alert(err.response?.data?.error || "Gagal menolak tawaran.");
            setCurrentOffer(null);
        }
    };
    
    const handleCompleteTask = async (pickupId) => {
        if (!confirm("Apakah Anda yakin sudah berada di TPA dan ingin menyelesaikan tugas ini?")) return;
        try {
            const response = await pickupAPI.completeTask(pickupId);
            alert(response.data.message);
            setActiveTask(null);

            window.location.reload();
        } catch (err) {
            console.error("Gagal menyelesaikan tugas:", err);
            alert(err.response?.data?.error || "Gagal menyelesaikan tugas.");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen pt-20 bg-gray-100"><PulseLoader color="#D93D41" /></div>;
    }

    if (error || !driverData) {
         return <div className="flex flex-col justify-center items-center text-center min-h-screen pt-20 bg-gray-100 text-red-500">
            <p>{error || "Data tidak dapat ditemukan."}</p>
            <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">Kembali ke Login</button>
         </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#000000] to-[#7c1215] p-6 pt-32 flex flex-wrap gap-4 justify-between items-center text-white rounded-b-xl shadow-md">
                <div>
                    <p className="text-sm ml-2">Selamat Bekerja,</p>
                    <h1 className="text-2xl font-bold ml-3">{driverData.first_name} {driverData.last_name}</h1>
                </div>
                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-full">
                    <span className={`font-semibold text-sm ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                        {isOnline ? 'AVAILABLE' : 'OFFLINE'}
                    </span>
                    <label htmlFor="statusToggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="statusToggle" className="sr-only peer" checked={isOnline} onChange={(e) => handleStatusToggle(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            </div>

            {/* KARTU TUGAS AKTIF DITAMPILKAN DI SINI */}
            <div className="p-4 md:px-6">
                <ActiveTaskCard task={activeTask} onComplete={handleCompleteTask} />
            </div>

            <div className="p-4 md:p-6 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktivitas Hari Ini</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-700 font-semibold">Tugas Masuk Hari Ini</p><p className="text-3xl font-bold text-blue-900">{driverStats.tasks_today}</p></div>
                        <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-700 font-semibold">Tugas Selesai (Total)</p><p className="text-3xl font-bold text-green-900">{driverStats.tasks_completed}</p></div>
                        <div className="p-4 bg-yellow-50 rounded-lg"><p className="text-sm text-yellow-700 font-semibold">Menunggu Konfirmasi</p><p className="text-3xl font-bold text-yellow-900">{driverStats.tasks_pending_confirmation}</p></div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-4 grid grid-cols-3 gap-3 text-center bg-white rounded-xl shadow-lg">
                        <Link href="/historydriver" className="block hover:scale-105 transition-transform group"><div className="nav-button-container"><FaHistory className="nav-button-icon" /><span className="nav-button-text">Riwayat</span></div></Link>
                        <button className="block hover:scale-105 transition-transform group"><div className="nav-button-container"><FaBell className="nav-button-icon" /><span className="nav-button-text">Notifikasi</span></div></button>
                        <button className="block hover:scale-105 transition-transform group"><div className="nav-button-container"><FaMapMarkedAlt className="nav-button-icon" /><span className="nav-button-text">Lihat Peta</span></div></button>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-3 text-center bg-white rounded-xl shadow-lg">
                        <button className="block hover:scale-105 transition-transform group"><div className="nav-button-container"><FaWallet className="nav-button-icon" /><span className="nav-button-text">Dompet</span></div></button>
                        <a href="https://wa.me/628113926360" target="_blank" rel="noopener noreferrer" className="block hover:scale-105 transition-transform group"><div className="nav-button-container"><FaHeadset className="nav-button-icon" /><span className="nav-button-text">Hubungi CS</span></div></a>
                        <button className="block hover:scale-105 transition-transform group"><div className="nav-button-container"><FaQuestionCircle className="nav-button-icon" /><span className="nav-button-text">Bantuan</span></div></button>
                    </div>
                    <MapPlaceholder />
                </div>
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6 text-gray-700 space-y-4 flex-grow">
                        <div className="flex flex-col items-center">
                            {driverData.profile_picture_url ? (
                                <img src={`${API_BASE_URL}${driverData.profile_picture_url}`} alt="Foto Profil" className="w-28 h-28 rounded-full object-cover border-4 border-red-200 shadow-md" />
                            ) : (
                                <FaUserCircle className="w-28 h-28 text-red-400" />
                            )}
                            <h2 className="text-xl font-semibold text-center mt-3">{driverData.first_name} {driverData.last_name}</h2>
                            <p className="text-sm text-gray-500">{driverData.driver_code}</p>
                            <div className="flex items-center gap-1 text-yellow-500 mt-2">
                                <FaStar />
                                <span className="font-bold text-gray-700">{Number(driverData.rating_average).toFixed(1)}</span>
                                <span className="text-xs text-gray-500">({driverData.total_ratings} ulasan)</span>
                            </div>
                        </div>
                        <div className="border-t pt-4 space-y-3 text-sm">
                            <div><label className="font-medium text-gray-500">Email:</label><p className="text-gray-800">{driverData.email}</p></div>
                            <div><label className="font-medium text-gray-500">Telepon:</label><p className="text-gray-800">{driverData.phone_number}</p></div>
                            <div><label className="font-medium text-gray-500">Area Operasi:</label><p className="text-gray-800">Jakarta Barat, Jakarta Pusat</p></div>
                            <div><label className="font-medium text-gray-500">Kendaraan:</label>
                                <p className="text-gray-800">{formatVehicleType(driverData.vehicle_type)} ({driverData.license_plate})</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full bg-red-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 text-lg shadow-md">
                        <MdLogout className="text-xl" /> Log Out
                    </button>
                </div>
            </div>
            
            <OfferNotificationModal 
                offer={currentOffer}
                onAccept={handleAcceptOffer}
                onDecline={handleDeclineOffer}
            />

            <style jsx>{`
                .nav-button-container{display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:#f0e2e2;width:100%;height:6rem;border-radius:0.5rem;box-shadow:inset 0 2px 4px 0 rgba(0,0,0,0.05);transition:background-color .2s}
                .group:hover .nav-button-container{background-color:#e2bbbb}
                .nav-button-icon{font-size:1.875rem;color:#7c1215}
                .nav-button-text{font-size:.75rem;margin-top:.375rem;color:#7c1215;font-weight:500}
            `}</style>
        </div>
    );
};

export default DriverProfile;