import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FaArrowAltCircleLeft, FaCamera, FaRegSadTear, FaPlusCircle } from "react-icons/fa";
import { Organik, Anorganik, B3 } from "@/assets"; 
import Image from 'next/image';
import { addressAPI, pickupAPI } from "@/services/api"; 
import AuthPromptModal from './AuthPromptModal'; 
import { useRouter } from "next/router";
import { PulseLoader } from "react-spinners"; 

const AddressSelectionModal = ({ isOpen, onClose, addresses, onSelectAddress, currentSelectedAddressId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
        <h3 className="text-xl font-semibold mb-5 text-gray-800 border-b pb-3">Pilih Alamat Penjemputan</h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {addresses.length === 0 && (
            <div className="text-center py-4">
                <FaRegSadTear className="text-4xl text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Anda belum memiliki alamat tersimpan.</p>
                <Link href="/address" passHref>
                  <button 
                    onClick={onClose} 
                    className="mt-3 text-sm bg-[#d93d41] text-white px-4 py-2 rounded-lg hover:bg-[#b92d31] transition-colors"
                  >
                    Tambah Alamat Baru
                  </button>
                </Link>
            </div>
          )}
          {addresses.map((addr) => (
            <div
              key={addr.address_id}
              onClick={() => { onSelectAddress(addr); onClose(); }}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                // Periksa apakah addr.address_id ada sebelum membandingkan
                currentSelectedAddressId && addr.address_id === currentSelectedAddressId 
                ? 'border-2 border-[#d93d41] bg-red-50 shadow-md' 
                : 'border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-700">{addr.address_text}</p>
              <p className="text-sm text-gray-500">{addr.city}, {addr.postal_code}</p>
              {/* Logika ini memastikan hanya span "Alamat Utama" yang muncul jika addr.is_active bernilai true (atau 1).
                Jika addr.is_active bernilai false (atau 0), tidak ada yang dirender dari baris ini,
                sehingga angka "0" tidak akan muncul.
              */}
              {!!addr.is_active && ( // Menggunakan !! untuk konversi eksplisit ke boolean jika is_active berupa angka 0 atau 1
                <span className="mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Alamat Utama
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  );
};


const ArrangePickup = () => {
  const [selectedTrashTypes, setSelectedTrashTypes] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");

  const [pickupAddress, setPickupAddress] = useState(null);
  const [allAddresses, setAllAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(""); 
  const [addressError, setAddressError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  const trashTypeOptions = [
    { category_id: 1, category_name: "ORGANIC", category_code: "ORG", image: Organik },
    { category_id: 2, category_name: "ANORGANIC", category_code: "ANORG", image: Anorganik },
    { category_id: 3, category_name: "B3", category_code: "B3", image: B3 },
  ];

  const fetchUserAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    setAddressError("");
    try {
      const response = await addressAPI.getAll(); 
      const fetchedAddresses = response.data || [];
      setAllAddresses(fetchedAddresses);
      if (fetchedAddresses.length > 0) {
        const defaultAddress = fetchedAddresses.find(addr => !!addr.is_active) || fetchedAddresses[0];
        setPickupAddress(defaultAddress);
      } else {
        setPickupAddress(null);
      }
    } catch (err) {
      console.error("Gagal mengambil alamat pengguna:", err.response?.data?.error || err.message);
      setAddressError("Gagal memuat alamat Anda. Pastikan Anda sudah menambahkan alamat atau coba lagi nanti.");
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []); 

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserAddresses();
    } else {
      setIsLoggedIn(false);
      setIsAuthModalOpen(true); 
      setIsLoadingAddresses(false); 
    }
  }, [fetchUserAddresses]); 

  const toggleTrashType = (typeCode) => {
    setSelectedTrashTypes((prev) =>
      prev.includes(typeCode) ? prev.filter((t) => t !== typeCode) : [...prev, typeCode]
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhoto(null);
      setPhotoPreview(null);
      alert("Harap pilih file gambar yang valid (JPEG, PNG, GIF).");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!pickupAddress) {
      setAddressError("Alamat penjemputan wajib dipilih. Silakan pilih atau tambahkan alamat baru.");
      setIsAddressModalOpen(true); 
      return;
    }
    if (selectedTrashTypes.length === 0) {
      setError("Pilih setidaknya satu jenis sampah.");
      return;
    }
    if (!pickupDate || !pickupTime) {
      setError("Tentukan tanggal dan waktu penjemputan.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setAddressError("");

    const formData = new FormData();
    formData.append('address_id', pickupAddress.address_id);
    formData.append('pickup_address', `${pickupAddress.address_text}, ${pickupAddress.city}, ${pickupAddress.postal_code}`);
    formData.append('pickup_date', pickupDate);
    formData.append('pickup_time', `${pickupDate} ${pickupTime}`); 
    selectedTrashTypes.forEach(type => formData.append('trash_types[]', type));
    if (photo) {
      formData.append('trash_photo', photo);
    }
    if (notes) {
        formData.append('notes', notes);
    }

    try {
      await pickupAPI.createRequest(formData); 
      alert("Permintaan penjemputan berhasil dibuat!");
      router.push("/historyuser");
    } catch (err) {
      console.error("Gagal membuat permintaan penjemputan:", err.response?.data?.error || err.message);
      setError(err.response?.data?.error || "Terjadi kesalahan saat mengirim permintaan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoggedIn && !isAuthModalOpen && isLoadingAddresses) { 
      return (
        <div className="flex justify-center items-center min-h-screen">
            <PulseLoader color="#D93D41" size={15} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-10">
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => {setIsAuthModalOpen(false); if(!isLoggedIn) router.push('/');}} />
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={allAddresses}
        onSelectAddress={(addr) => setPickupAddress(addr)}
        currentSelectedAddressId={pickupAddress?.address_id}
      />

      <div className="container mx-auto px-4 max-w-lg">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-[#7c1215] font-semibold flex items-center text-sm hover:text-[#a03236] transition-colors"
          >
            <FaArrowAltCircleLeft className="mr-2 text-3xl" /> <p className="text-base">Kembali</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl p-6 sm:p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Atur Penjemputan Sampah</h2>

          {error && <p className="text-red-500 text-sm mb-4 text-center p-2 bg-red-50 rounded-md">{error}</p>}

          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-gray-700">Alamat Penjemputan</h3>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-[#d93d41] text-sm font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
                  disabled={isLoadingAddresses} 
                >
                  {isLoadingAddresses ? "Memuat..." : (allAddresses.length === 0 ? "Tambah Alamat" : "Ganti Alamat")}
                </button>
              )}
            </div>
            {isLoadingAddresses && (
                <div className="flex items-center text-sm text-gray-500">
                    <PulseLoader color="#7c1215" size={6} className="mr-2"/> Memuat alamat Anda...
                </div>
            )}
            {!isLoadingAddresses && addressError && (
                <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{addressError}</p>
            )}
            {!isLoadingAddresses && !addressError && isLoggedIn && pickupAddress && (
              <div>
                <p className="text-sm text-gray-700 leading-tight font-medium">{pickupAddress.address_text}</p>
                <p className="text-xs text-gray-500 leading-tight">{pickupAddress.city}, {pickupAddress.postal_code}</p>
                {!!pickupAddress.is_active && <span className="text-xs text-green-600 font-semibold">(Alamat Utama)</span>}
              </div>
            )}
            {!isLoadingAddresses && !addressError && isLoggedIn && !pickupAddress && allAddresses.length > 0 && (
                 <p className="text-sm text-gray-500">Pilih alamat dari daftar.</p>
            )}
            {!isLoadingAddresses && !addressError && isLoggedIn && allAddresses.length === 0 && (
                <div className="text-center py-3">
                    <FaRegSadTear className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Anda belum memiliki alamat tersimpan.</p>
                    <Link href="/address" passHref>
                      <button className="text-sm bg-[#d93d41] text-white px-3 py-1.5 rounded-md hover:bg-[#b92d31] transition-colors">
                        Tambah Alamat Sekarang
                      </button>
                    </Link>
                </div>
            )}
          </div>

          <div className="mb-5">
            <h3 className="font-semibold text-gray-700 mb-2">Jenis Sampah <span className="text-xs text-gray-500">(Pilih satu atau lebih)</span></h3>
            <div className="grid grid-cols-3 gap-3">
              {trashTypeOptions.map((type) => (
                <div
                  key={type.category_code}
                  onClick={() => toggleTrashType(type.category_code)}
                  className={`border rounded-lg cursor-pointer p-3 text-center transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    selectedTrashTypes.includes(type.category_code) ? "border-[#d93d41] ring-2 ring-[#d93d41] bg-red-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image src={type.image} alt={type.category_name} width={60} height={60} className="mx-auto mb-1" />
                  <p className="font-medium text-xs sm:text-sm text-gray-700">{type.category_name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <h3 className="font-semibold text-gray-700 mb-2">Foto Sampah (Opsional)</h3>
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#d93d41] transition-colors">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              {photoPreview ? (
                <Image src={photoPreview} alt="Preview Sampah" width={100} height={100} className="h-24 w-auto max-w-full mx-auto rounded" />
              ) : (
                <div className="text-gray-400">
                  <FaCamera className="text-3xl mx-auto mb-1" />
                  <p className="text-sm">Klik untuk tambah foto</p>
                </div>
              )}
            </label>
          </div>

          <div className="mb-5">
            <h3 className="font-semibold text-gray-700 mb-2">Jadwal Penjemputan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split("T")[0]} 
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm"
                required
              />
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm"
                required
              />
            </div>
          </div>
           <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Catatan (Opsional)</h3>
            <textarea
                name="notes"
                rows="3"
                placeholder="Contoh: Sampah diletakkan di depan pagar."
                className="block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
           </div>

          <button
            type="submit"
            disabled={isSubmitting || isLoadingAddresses || !isLoggedIn}
            className="w-full bg-[#d93d41] text-white font-semibold py-3 px-4 rounded-full hover:bg-[#b92d31] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d93d41] disabled:opacity-60 flex items-center justify-center"
          >
            {isSubmitting ? <PulseLoader size={8} color="#fff" /> : "Atur Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ArrangePickup;
