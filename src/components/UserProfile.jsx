import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authAPI, userAPI } from "@/services/api";
import { FaBook, FaBookmark, FaTruckMoving, FaRegSadTear, FaUserCircle, FaCamera, FaEdit, FaSave, FaTimes, FaKey } from "react-icons/fa";
import { MdPinDrop, MdCurrencyExchange, MdLogout, MdTrendingUp, MdTrendingDown, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { TbPigMoney } from "react-icons/tb";
import { PulseLoader } from "react-spinners";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [userPoints, setUserPoints] = useState({
    current_points: 0,
    total_points_earned: 0,
    total_points_redeemed: 0,
  });
  const [recentPointsHistory, setRecentPointsHistory] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // State untuk mode edit profil
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  // State untuk foto profil
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const fileInputRef = useRef(null);

  // State untuk modal ganti password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);


  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"; // Sesuaikan dengan URL backend Anda

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const profilePromise = userAPI.getProfile();
        const pointsSummaryPromise = userAPI.getPoints();
        const recentHistoryPromise = userAPI.getRecentPointsHistory();

        const [profileResponse, pointsSummaryResponse, recentHistoryResponse] = await Promise.all([
          profilePromise,
          pointsSummaryPromise,
          recentHistoryPromise
        ]);

        setUserData(profileResponse.data);
        setEditFormData({
            first_name: profileResponse.data.first_name || "",
            last_name: profileResponse.data.last_name || "",
            phone_number: profileResponse.data.phone_number || "",
        });
        if (profileResponse.data.profile_picture_url) {
            setProfilePicturePreview(`${API_BASE_URL}${profileResponse.data.profile_picture_url}`);
        }
        localStorage.setItem("userData", JSON.stringify(profileResponse.data));


        setUserPoints({
          current_points: pointsSummaryResponse.data.current_points || 0,
          total_points_earned: pointsSummaryResponse.data.total_points_earned || 0,
          total_points_redeemed: pointsSummaryResponse.data.total_points_redeemed || 0,
        });
        
        setRecentPointsHistory(recentHistoryResponse.data || []);

      } catch (err) {
        console.error("Gagal mengambil data profil atau poin:", err);
        setError("Gagal memuat data profil Anda. Coba lagi nanti.");
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          handleLogout(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [router, API_BASE_URL]);

  const handleLogout = async (callApi = true) => {
    if (callApi) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error("Logout API error:", error);
        // Tidak perlu menampilkan error ke user jika logout API gagal, yang penting token di client dihapus
      }
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.dispatchEvent(new CustomEvent("authChange")); // Untuk update UI lain jika ada
    router.push("/");
  };
  
  const formatDateSimple = (dateString) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {day: '2-digit', month: 'short', year: 'numeric'});
    } catch (e) { return ""; }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccessMessage("");
    if (!editFormData.first_name || !editFormData.last_name || !editFormData.phone_number) {
        setError("Nama depan, nama belakang, dan nomor telepon tidak boleh kosong.");
        return;
    }
    try {
        setIsLoading(true); // Atau state loading spesifik untuk save
        const response = await userAPI.updateProfile(editFormData);
        setUserData(prev => ({ ...prev, ...editFormData }));
        localStorage.setItem("userData", JSON.stringify({ ...userData, ...editFormData }));
        setSuccessMessage(response.data.message || "Profil berhasil diperbarui.");
        setIsEditMode(false);
        setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
        console.error("Gagal update profil:", err);
        setError(err.response?.data?.error || "Gagal memperbarui profil. Coba lagi.");
        setTimeout(() => setError(""), 3000);
    } finally {
        setIsLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("Ukuran file maksimal 5MB.");
            setTimeout(() => setError(""), 3000);
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError("Hanya file gambar yang diizinkan.");
            setTimeout(() => setError(""), 3000);
            return;
        }
        setProfilePictureFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicturePreview(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePictureFile) {
        setError("Pilih file foto terlebih dahulu.");
        setTimeout(() => setError(""), 3000);
        return;
    }
    setError("");
    setSuccessMessage("");
    const formData = new FormData();
    formData.append("avatar", profilePictureFile);

    try {
        setIsLoading(true); // Atau state loading spesifik
        const response = await userAPI.uploadAvatar(formData);
        setUserData(prev => ({ ...prev, profile_picture_url: response.data.profile_picture_url }));
        // Update preview dengan URL dari server agar konsisten
        setProfilePicturePreview(`${API_BASE_URL}${response.data.profile_picture_url}`);
        localStorage.setItem("userData", JSON.stringify({ ...userData, profile_picture_url: response.data.profile_picture_url }));
        setSuccessMessage(response.data.message || "Foto profil berhasil diunggah.");
        setProfilePictureFile(null); // Reset file input
        setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
        console.error("Gagal unggah foto profil:", err);
        setError(err.response?.data?.error || "Gagal mengunggah foto profil. Coba lagi.");
        setTimeout(() => setError(""), 3000);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setPasswordError("Password baru dan konfirmasi tidak cocok.");
        return;
    }
    if (passwordData.newPassword.length < 6) {
        setPasswordError("Password baru minimal 6 karakter.");
        return;
    }

    try {
        setIsLoading(true); // Atau state loading spesifik
        const response = await userAPI.changePassword({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
            confirmNewPassword: passwordData.confirmNewPassword,
        });
        setPasswordSuccess(response.data.message || "Password berhasil diubah.");
        setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" }); // Reset form
        setTimeout(() => {
            setShowPasswordModal(false);
            setPasswordSuccess("");
        }, 2000);
    } catch (err) {
        console.error("Gagal ganti password:", err);
        setPasswordError(err.response?.data?.error || "Gagal mengganti password.");
    } finally {
        setIsLoading(false);
    }
  };


  if (isLoading && !userData) { // Tampilkan loader utama jika belum ada data sama sekali
    return (
      <div className="flex justify-center items-center min-h-screen pt-20 bg-gray-100">
        <PulseLoader color="#D93D41" loading={true} size={15} />
      </div>
    );
  }

  if (error && !userData && !isEditMode) { // Tampilkan error utama jika fetch awal gagal
    return (
      <div className="flex flex-col justify-center items-center min-h-screen pt-20 bg-gray-100 text-center px-4">
        <FaRegSadTear className="text-6xl text-gray-400 mx-auto mb-5" />
        <p className="text-red-500 text-lg mb-3">{error}</p>
        <button
          onClick={() => handleLogout(false)}
          className="mt-4 bg-[#d93d41] text-white px-6 py-2 rounded-full hover:bg-[#b92d31] transition"
        >
          Kembali ke Halaman Utama
        </button>
      </div>
    );
  }
  
  if (!userData && !isLoading) { // Jika tidak loading dan tidak ada user data (setelah fetch)
    return (
        <div className="flex flex-col justify-center items-center min-h-screen pt-20 bg-gray-100 text-center px-4">
            <FaRegSadTear className="text-6xl text-gray-400 mx-auto mb-5" />
            <p className="text-gray-700 text-lg">Data pengguna tidak ditemukan atau sesi Anda telah berakhir.</p>
            <button
              onClick={() => handleLogout(false)}
              className="mt-4 bg-[#d93d41] text-white px-6 py-2 rounded-full hover:bg-[#b92d31] transition"
            >
              Login Kembali
            </button>
        </div>
    );
  }


  const lastIncomingTransaction = recentPointsHistory.find(t => t.points_earned > 0 && (t.points_type === 'pickup' || t.points_type === 'bonus' || t.points_type === 'referral' || t.points_type === 'manual'));
  const lastOutgoingTransaction = recentPointsHistory.find(t => t.points_earned < 0 || t.points_type === 'redeem' || (t.points_type === 'redemption' && t.points_redeemed > 0));


  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header Pengguna */}
      <div className="bg-gradient-to-b from-[#000000] to-[#7c1215] p-6 pt-32 flex flex-wrap gap-4 justify-between items-center text-white rounded-b-xl shadow-md">
        <div>
          <p className="text-sm ml-2">Selamat Datang,</p>
          <h1 className="text-2xl font-bold ml-3">
            {userData?.first_name} {userData?.last_name}
          </h1>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link href="/address">
            <button className="bg-white text-[#d93d41] px-3 py-2 sm:px-4 rounded-full hover:bg-gray-100 transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shadow">
              <FaBookmark className="text-md sm:text-xl hidden xs:inline" /> Alamat
            </button>
          </Link>
        </div>
      </div>

      {/* Notifikasi Global */}
      {error && <div className="m-4 p-3 bg-red-100 text-red-700 rounded-md text-center">{error}</div>}
      {successMessage && <div className="m-4 p-3 bg-green-100 text-green-700 rounded-md text-center">{successMessage}</div>}
      
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Kolom Kiri: Poin Loyalitas */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#d93d41] to-[#b92d31] text-white rounded-xl p-6 shadow-xl flex flex-col justify-between relative">
            {/* ... (Konten Poin Loyalitas tidak berubah signifikan, bisa disesuaikan jika perlu) ... */}
            <div className="flex flex-col items-start mb-6">
              <div className="flex items-center gap-3 mb-1">
                  <TbPigMoney className="text-5xl text-yellow-300" />
                  <h2 className="text-2xl font-semibold">Poin Loyalitas Anda</h2>
              </div>
              <p className="text-sm opacity-90 ml-1">Poin Aktif Saat Ini</p>
              <p className="text-5xl font-bold mt-1">{userPoints.current_points} <span className="text-3xl opacity-80">Poin</span></p>
            </div>
            <Link href="/redeem">
              <button className="absolute top-6 right-6 bg-white text-[#d93d41] px-4 py-2 rounded-full hover:bg-gray-100 transition w-fit text-sm sm:text-base font-semibold shadow-md flex items-center gap-2">
                  <MdCurrencyExchange className="text-xl sm:text-2xl" />
                  <p className="hidden xs:inline">Tukar Poin</p>
              </button>
            </Link>
            <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col items-start p-3 bg-black bg-opacity-20 rounded-lg backdrop-blur-sm">
                <div className="flex items-center text-green-300 mb-1">
                  <MdTrendingUp className="text-2xl mr-2" />
                  <p className="font-semibold">Total Poin Didapat</p>
                </div>
                <p className="text-xl font-bold">{userPoints.total_points_earned} Poin</p>
                {lastIncomingTransaction && (
                  <p className="text-xs opacity-80 mt-1">
                    Terakhir: +{lastIncomingTransaction.points_earned} ({formatDateSimple(lastIncomingTransaction.created_at)})
                  </p>
                )}
              </div>
              <div className="bg-black bg-opacity-20 rounded-lg backdrop-blur-sm p-3 flex flex-col items-start">
                <div className="flex flex-row items-center text-red-300 mb-1">
                  <MdTrendingDown className="text-2xl mr-2" />
                  <p className="font-semibold">Total Poin Ditukar</p>
                </div>
                <p className="text-xl font-bold">{userPoints.total_points_redeemed} Poin</p>
                {lastOutgoingTransaction && (
                  <p className="text-xs opacity-80 mt-1">
                    Terakhir: {lastOutgoingTransaction.points_earned < 0 ? lastOutgoingTransaction.points_earned : '-' + (lastOutgoingTransaction.points_redeemed || lastOutgoingTransaction.points_earned)} ({formatDateSimple(lastOutgoingTransaction.created_at)})
                  </p>
                )}
              </div>
            </div>
        </div>

        {/* Kolom Tengah: Navigasi Cepat & Artikel */}
        <div className="lg:col-span-1 space-y-6">
            <div className="p-4 grid grid-cols-3 gap-3 text-center bg-white rounded-xl shadow-lg">
              {[
                { href: "/historyuser", icon: FaBook, label: "Riwayat" },
                { href: "/services#drop-point", icon: MdPinDrop, label: "Drop Point" },
                { href: "/pickup", icon: FaTruckMoving, label: "Pick Up" },
              ].map(item => (
                <Link key={item.label} href={item.href} className="block hover:scale-105 transition-transform group">
                  <div className="flex flex-col items-center justify-center bg-[#f0e2e2] group-hover:bg-[#e2bbbb] w-full h-24 rounded-lg py-2 shadow-md transition-colors">
                    <item.icon className="text-3xl sm:text-4xl text-[#7c1215] group-hover:text-[#5a0e10] transition-colors" />
                    <span className="text-xs sm:text-sm mt-1.5 text-[#7c1215] group-hover:text-[#5a0e10] font-medium transition-colors">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Artikel Terbaru Untuk Anda
              </h3>
              <div className="text-center text-gray-500 text-sm py-5">
                  <FaRegSadTear className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p>Belum ada artikel baru yang dipersonalisasi untuk Anda. Cek kembali nanti!</p>
              </div>
            </div>
        </div>
        
        {/* Kolom Kanan: Detail Profil & Edit */}
        <div className="bg-white rounded-xl shadow-md p-6 text-gray-700 space-y-6">
            <div className="flex flex-col items-center">
                 {/* Foto Profil */}
                <div className="relative group w-36 h-36 mb-4">
                    {profilePicturePreview ? (
                        <img src={profilePicturePreview} alt="Foto Profil" className="w-full h-full rounded-full object-cover border-4 border-red-200 shadow-md" />
                    ) : (
                        <FaUserCircle className="w-full h-full text-red-400 rounded-full bg-red-100 border-4 border-red-200" />
                    )}
                    {isEditMode && (
                        <button
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            className="absolute bottom-1 right-1 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-300 opacity-80 group-hover:opacity-100 shadow-md"
                            aria-label="Ganti foto profil"
                        >
                            <FaCamera />
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfilePictureChange}
                        accept="image/*"
                        className="hidden"
                        disabled={!isEditMode}
                    />
                </div>
                {isEditMode && profilePictureFile && (
                     <button 
                        onClick={handleUploadProfilePicture} 
                        disabled={isLoading}
                        className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <FaSave /> {isLoading ? <PulseLoader size={6} color="#fff"/> : "Simpan Foto"}
                    </button>
                )}

                {/* Nama Pengguna */}
                {!isEditMode ? (
                    <h2 className="text-2xl font-semibold text-center">{userData?.first_name} {userData?.last_name}</h2>
                ) : (
                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-2">
                        <input
                            type="text"
                            name="first_name"
                            value={editFormData.first_name}
                            onChange={handleEditInputChange}
                            placeholder="Nama Depan"
                            className="p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        />
                        <input
                            type="text"
                            name="last_name"
                            value={editFormData.last_name}
                            onChange={handleEditInputChange}
                            placeholder="Nama Belakang"
                            className="p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                )}
                 <p className="text-sm text-gray-500">{userData?.account_status === 'active' ? 'Akun Terverifikasi' : `Status: ${userData?.account_status}`}</p>
            </div>

            {/* Detail Informasi */}
            <div className="space-y-3 text-sm">
                <div>
                    <label className="font-medium text-gray-500">Email:</label>
                    <p className="text-gray-800">{userData?.email}</p>
                </div>
                <div>
                    <label className="font-medium text-gray-500">Telepon:</label>
                    {!isEditMode ? (
                        <p className="text-gray-800">{userData?.phone_number}</p>
                    ) : (
                        <input
                            type="tel"
                            name="phone_number"
                            value={editFormData.phone_number}
                            onChange={handleEditInputChange}
                            placeholder="Nomor Telepon"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        />
                    )}
                </div>
                <div>
                    <label className="font-medium text-gray-500">Password:</label>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-800">••••••••</p>
                        <button 
                            onClick={() => { setPasswordError(''); setPasswordSuccess(''); setShowPasswordModal(true); }}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                           <FaKey/> Ganti Password
                        </button>
                    </div>
                </div>
                 <div>
                    <label className="font-medium text-gray-500">Bergabung Sejak:</label>
                    <p className="text-gray-800">{formatDateSimple(userData?.created_at)}</p>
                </div>
            </div>

            {/* Tombol Edit/Simpan Profil */}
            <div className="mt-6 flex justify-end gap-3">
                {isEditMode ? (
                    <>
                        <button 
                            onClick={() => {
                                setIsEditMode(false);
                                // Reset form ke data asli jika batal
                                setEditFormData({
                                    first_name: userData?.first_name || "",
                                    last_name: userData?.last_name || "",
                                    phone_number: userData?.phone_number || "",
                                });
                                if (userData?.profile_picture_url) {
                                     setProfilePicturePreview(`${API_BASE_URL}${userData.profile_picture_url}`);
                                } else {
                                    setProfilePicturePreview(null);
                                }
                                setProfilePictureFile(null);
                                setError("");
                            }}
                            disabled={isLoading}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-full text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                           <FaTimes/> Batal
                        </button>
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-1 disabled:opacity-50"
                        >
                           <FaSave/> {isLoading ? <PulseLoader size={6} color="#fff"/> : "Simpan Perubahan"}
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsEditMode(true)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-1"
                    >
                       <FaEdit/> Edit Profil
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Tombol Logout */}
      <div className="max-w-5xl mx-auto p-4 md:px-6 mt-8 mb-8">
        <button
          onClick={() => handleLogout()}
          className="w-full max-w-sm mx-auto bg-red-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg"
        >
          <MdLogout className="text-xl" /> Log Out
        </button>
      </div>

      {/* Modal Ganti Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Ganti Password</h3>
                {passwordError && <p className="text-red-500 text-sm mb-3">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-500 text-sm mb-3">{passwordSuccess}</p>}
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Password Lama</label>
                        <input 
                            type={showOldPassword ? "text" : "password"}
                            name="oldPassword" 
                            value={passwordData.oldPassword} 
                            onChange={handlePasswordInputChange}
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center text-sm leading-5">
                            {showOldPassword ? <MdVisibilityOff size={20}/> : <MdVisibility size={20}/>}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                        <input 
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword" 
                            value={passwordData.newPassword} 
                            onChange={handlePasswordInputChange}
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                         <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center text-sm leading-5">
                            {showNewPassword ? <MdVisibilityOff size={20}/> : <MdVisibility size={20}/>}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                        <input 
                            type={showConfirmNewPassword ? "text" : "password"}
                            name="confirmNewPassword" 
                            value={passwordData.confirmNewPassword} 
                            onChange={handlePasswordInputChange}
                            required 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                        <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center text-sm leading-5">
                            {showConfirmNewPassword ? <MdVisibilityOff size={20}/> : <MdVisibility size={20}/>}
                        </button>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => {setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess('');}}
                            disabled={isLoading && passwordSuccess === ""} // disable if loading and not yet success
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm flex items-center justify-center disabled:opacity-50 w-28"
                        >
                            {isLoading && !passwordSuccess ? <PulseLoader size={8} color="#fff"/> : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
