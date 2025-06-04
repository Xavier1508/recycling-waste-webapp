import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FaArrowAltCircleLeft, FaEdit, FaTrash, FaRegStar, FaPlusCircle, FaRegSadTear, FaMapMarkerAlt } from "react-icons/fa";
import { addressAPI } from "@/services/api";
import { useRouter } from "next/router";
import AuthPromptModal from './AuthPromptModal'; // Pastikan path ini benar
import { PulseLoader } from "react-spinners"; // Untuk loading spesifik

const SavedAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true); // Loading untuk daftar alamat
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading untuk submit form
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    address_id: null,
    address_text: "",
    city: "",
    postal_code: "",
    is_active: false,
    latitude: null, // Untuk pin point nanti
    longitude: null, // Untuk pin point nanti
  });
  const [formError, setFormError] = useState("");

  const router = useRouter();

  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    setError("");
    try {
      const response = await addressAPI.getAll();
      setAddresses(response.data || []);
    } catch (err) {
      console.error("Gagal mengambil alamat:", err);
      setError("Tidak dapat memuat daftar alamat. Coba lagi nanti.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setIsAuthModalOpen(true);
      }
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []); // useCallback agar tidak dibuat ulang kecuali dependency berubah

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      fetchAddresses();
    } else {
      setIsLoggedIn(false);
      setIsLoadingAddresses(false); // Selesai loading jika tidak login
    }
  }, [fetchAddresses]); // fetchAddresses sebagai dependency

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setCurrentAddress({ address_id: null, address_text: "", city: "", postal_code: "", is_active: false, latitude: null, longitude: null });
    setFormError("");
    setIsFormVisible(false);
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!currentAddress.address_text || !currentAddress.city || !currentAddress.postal_code) {
      setFormError("Alamat lengkap, kota/kabupaten, dan kode pos wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        address_text: currentAddress.address_text,
        city: currentAddress.city,
        postal_code: currentAddress.postal_code,
        // latitude: currentAddress.latitude, // Akan ditambahkan nanti
        // longitude: currentAddress.longitude, // Akan ditambahkan nanti
      };

      if (currentAddress.address_id) {
        await addressAPI.update(currentAddress.address_id, payload);
      } else {
        payload.is_active = currentAddress.is_active; // Hanya kirim is_active saat menambah
        await addressAPI.add(payload);
      }
      fetchAddresses();
      resetForm();
    } catch (err) {
      console.error("Gagal menyimpan alamat:", err.response || err);
      setFormError(err.response?.data?.error || "Terjadi kesalahan saat menyimpan alamat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address) => {
    setCurrentAddress({
        address_id: address.address_id,
        address_text: address.address_text,
        city: address.city,
        postal_code: address.postal_code,
        is_active: address.is_active,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
    });
    setIsFormVisible(true);
    setFormError("");
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas form
  };

  const handleDelete = async (addressId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      // Optimistik UI: hapus dulu dari state, lalu panggil API
      const originalAddresses = [...addresses];
      setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
      try {
        await addressAPI.delete(addressId);
        // fetchAddresses(); // Tidak perlu fetch ulang jika optimistik berhasil
      } catch (err) {
        console.error("Gagal menghapus alamat:", err);
        alert(err.response?.data?.error || "Gagal menghapus alamat.");
        setAddresses(originalAddresses); // Kembalikan jika gagal
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    // Optimistik UI
    const originalAddresses = addresses.map(addr => ({...addr}));
    setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_active: addr.address_id === addressId
    })));

    try {
      await addressAPI.setDefault(addressId);
      // fetchAddresses(); // Tidak perlu fetch ulang jika optimistik berhasil dan backend konsisten
    } catch (err) {
      console.error("Gagal menjadikan alamat utama:", err);
      alert(err.response?.data?.error || "Gagal menjadikan alamat utama.");
      setAddresses(originalAddresses); // Kembalikan jika gagal
    }
  };

  const openNewAddressForm = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    resetForm();
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-10">
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-[#7c1215] font-semibold flex items-center text-sm hover:text-[#a03236] transition-colors"
          >
            <FaArrowAltCircleLeft className="mr-2 text-3xl" /> <p className="text-base">Kembali</p>
          </button>
        </div>

        <div className="lg:flex lg:gap-8">
          {/* Kolom Form (Kiri di layar besar, Atas di layar kecil) */}
          {/* Form selalu tampil jika isFormVisible atau jika user login tapi belum ada alamat */}
          {(isFormVisible || (isLoggedIn && addresses.length === 0 && !isLoadingAddresses && !error)) && (
            <div className={`lg:w-1/3 mb-8 lg:mb-0`}>
              <div className="bg-white p-6 rounded-xl shadow-lg sticky top-28"> {/* Sticky form */}
                <h2 className="text-xl font-bold mb-5 text-gray-800">
                  {currentAddress.address_id ? "Edit Alamat" : "Tambah Alamat Baru"}
                </h2>
                {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{formError}</p>}
                <form onSubmit={handleSubmitAddress} className="space-y-4">
                  <div>
                    <label htmlFor="address_text" className="block text-sm font-medium text-gray-700">Alamat Lengkap (Nama Jalan, No Rumah, RT/RW, Kelurahan)</label>
                    <textarea
                      id="address_text"
                      name="address_text"
                      rows="3"
                      placeholder="Contoh: Jl. Merdeka No. 10, RT 01/RW 02, Kel. Bahagia"
                      className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm"
                      value={currentAddress.address_text}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kota / Kabupaten</label>
                    <input
                      type="text" name="city" id="city" placeholder="Contoh: Surabaya"
                      className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm"
                      value={currentAddress.city} onChange={handleInputChange} required
                    />
                  </div>
                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Kode Pos</label>
                    <input
                      type="text" name="postal_code" id="postal_code" placeholder="Contoh: 60210"
                      className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm"
                      value={currentAddress.postal_code} onChange={handleInputChange} required
                    />
                  </div>
                  {/* Fitur Pin Point akan ditambahkan di sini nanti */}
                  {/* <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Pin Point Lokasi</label>
                      <div className="mt-1 p-3 border border-gray-300 rounded-md h-40 bg-gray-50 flex items-center justify-center text-gray-400">
                          Map akan muncul di sini
                      </div>
                      <button type="button" className="mt-2 text-sm text-[#d93d41] hover:underline">Atur Pin Point</button>
                  </div> */}

                  {!currentAddress.address_id && (
                      <div className="flex items-center">
                          <input
                          id="is_active" name="is_active" type="checkbox"
                          className="h-4 w-4 text-[#d93d41] focus:ring-[#d93d41] border-gray-300 rounded"
                          checked={currentAddress.is_active} onChange={handleInputChange}
                          />
                          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                          Jadikan Alamat Utama
                          </label>
                      </div>
                  )}
                  <div className="flex gap-3 pt-2">
                      <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#7c1215] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#a03236] transition-colors disabled:opacity-70 flex items-center justify-center"
                      >
                          {isSubmitting ? <PulseLoader size={8} color="#fff" /> : (currentAddress.address_id ? "Simpan Perubahan" : "Tambah Alamat")}
                      </button>
                      {isFormVisible && (
                          <button
                          type="button" onClick={resetForm}
                          className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                          >
                          Batal
                          </button>
                      )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Kolom Daftar Alamat */}
          <div className={`${(isFormVisible || (isLoggedIn && addresses.length === 0 && !isLoadingAddresses && !error)) ? 'lg:w-2/3' : 'w-full'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Daftar Alamat Tersimpan</h2>
                {/* Tombol tambah hanya muncul jika form tidak visible dan ada alamat */}
                {!isFormVisible && isLoggedIn && addresses.length > 0 && (
                     <button
                        onClick={openNewAddressForm}
                        className="bg-green-500 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center text-xs sm:text-sm shadow-md"
                        >
                        <FaPlusCircle className="mr-1 sm:mr-2"/> Tambah Baru
                    </button>
                )}
            </div>

            {isLoadingAddresses && (
                <div className="flex justify-center items-center py-10">
                    <PulseLoader color="#7c1215" size={10} />
                </div>
            )}
            {!isLoadingAddresses && error && (
                <div className="text-center py-10 bg-white rounded-lg shadow-md p-6">
                    <FaRegSadTear className="text-5xl text-red-400 mx-auto mb-4" />
                    <p className="text-red-600 font-medium">{error}</p>
                    <button onClick={fetchAddresses} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Coba Lagi</button>
                </div>
            )}
            {!isLoadingAddresses && !error && !isLoggedIn && (
                 <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <FaRegSadTear className="text-6xl text-gray-400 mx-auto mb-5" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Login Dulu Yuk!</h3>
                    <p className="text-gray-500 mb-5">Anda harus login untuk dapat melihat dan menambahkan alamat pengiriman.</p>
                    <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#d93d41] text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-[#b92d31] transition-colors">
                        Login atau Daftar
                    </button>
                 </div>
            )}
            {/* Pesan jika login tapi tidak ada alamat dan form tidak visible */}
            {!isLoadingAddresses && !error && isLoggedIn && addresses.length === 0 && !isFormVisible && (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <FaRegSadTear className="text-6xl text-gray-400 mx-auto mb-5" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Alamat Masih Kosong</h3>
                <p className="text-gray-500 mb-5">Sepertinya Anda belum menambahkan alamat. Tambahkan alamat pertama Anda sekarang!</p>
                <button
                    onClick={openNewAddressForm}
                    className="bg-[#d93d41] text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-[#b92d31] transition-colors flex items-center justify-center mx-auto"
                >
                   <FaPlusCircle className="mr-2"/> Tambah Alamat
                </button>
              </div>
            )}

            {/* Daftar alamat hanya tampil jika tidak ada form, login, dan ada alamat */}
            {!isFormVisible && isLoggedIn && addresses.length > 0 && (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.address_id}
                    className={`bg-white p-4 rounded-lg shadow-md border-l-4 transition-all hover:shadow-xl ${
                      address.is_active ? "border-green-500" : "border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow mr-2">
                        <p className="font-semibold text-gray-700 break-words">{address.address_text}</p>
                        <p className="text-sm text-gray-500 break-words">{address.city}, {address.postal_code}</p>
                        {address.is_active && (
                          <span className="mt-1 inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Alamat Utama
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(address)}
                          className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit Alamat"
                        >
                          <FaEdit className="text-sm sm:text-base"/>
                        </button>
                        <button
                          onClick={() => handleDelete(address.address_id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          title="Hapus Alamat"
                          disabled={isSubmitting} // Disable saat ada proses submit lain
                        >
                          <FaTrash className="text-sm sm:text-base"/>
                        </button>
                      </div>
                    </div>
                    {!address.is_active && (
                      <button
                        onClick={() => handleSetDefault(address.address_id)}
                        className="mt-2 text-xs text-green-600 hover:text-green-800 font-semibold flex items-center disabled:opacity-50 py-1 px-2 rounded-md hover:bg-green-50 transition-colors"
                        disabled={isSubmitting}
                      >
                        <FaRegStar className="mr-1"/> Jadikan Alamat Utama
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedAddress;
