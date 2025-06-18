import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { FaArrowAltCircleLeft, FaEdit, FaTrash, FaRegStar, FaPlusCircle, FaRegSadTear, FaMapMarkerAlt, FaSave, FaTimes } from "react-icons/fa";
import { addressAPI, locationAPI } from "@/services/api";
import { useRouter } from "next/router";
import AuthPromptModal from './AuthPromptModal';
import { PulseLoader } from "react-spinners";
import Image from 'next/image';
import dynamic from "next/dynamic";

const PinPointMap = dynamic(() => import("./PinPointMap"), { 
    ssr: false,
    loading: () => <div className="h-[50vh] w-full flex justify-center items-center bg-gray-200 rounded-md"><p>Memuat Peta...</p></div>
});

const AddressForm = ({ onSave, onCancel, existingAddress, isSaving, formError }) => {
  const [formData, setFormData] = useState({
    alias_name: "", 
    address_text: "", 
    city: "", 
    province: "",
    postal_code: "", 
    is_active: false, 
    latitude: null, 
    longitude: null, 
    gmaps_place_id: null
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (existingAddress) {
      setFormData({
        alias_name: existingAddress.alias_name || "",
        address_text: existingAddress.address_text || "",
        city: existingAddress.city || "",
        province: existingAddress.province || "",
        postal_code: existingAddress.postal_code || "",
        is_active: existingAddress.is_active || false,
        latitude: existingAddress.latitude || null,
        longitude: existingAddress.longitude || null,
        gmaps_place_id: existingAddress.gmaps_place_id || null,
      });
      setSearchQuery(existingAddress.address_text || "");
    } else {
      setFormData({ 
        alias_name: "", 
        address_text: "", 
        city: "", 
        province: "", 
        postal_code: "", 
        is_active: false, 
        latitude: null, 
        longitude: null, 
        gmaps_place_id: null 
      });
      setSearchQuery("");
    }
  }, [existingAddress]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFormData(prev => ({ ...prev, address_text: query }));
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (query.length > 3) {
      setIsSearching(true);
      debounceTimeout.current = setTimeout(async () => {
        try {
          const response = await locationAPI.getAutocomplete(query);
          setSuggestions(response.data || []);
        } catch (error) { 
          console.error("Autocomplete error:", error); 
        } finally { 
          setIsSearching(false); 
        }
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setFormData(prev => ({
      ...prev,
      address_text: suggestion.address.house_number ? `${suggestion.address.road}, ${suggestion.address.house_number}` : suggestion.address.road || suggestion.display_name,
      city: suggestion.address.city || suggestion.address.county || "",
      province: suggestion.address.state || "",
      postal_code: suggestion.address.postcode || "",
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      gmaps_place_id: `liq_${suggestion.place_id}`
    }));
  };
  
  const handleMapConfirm = (position) => {
    setFormData(prev => ({ ...prev, latitude: position.lat, longitude: position.lng }));
    setIsMapOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
  
  return (
    <>
      {isMapOpen && (
        <PinPointMap
          initialPosition={{ lat: formData.latitude || -6.1754, lng: formData.longitude || 106.8272 }}
          onConfirmLocation={handleMapConfirm}
          onCancel={() => setIsMapOpen(false)}
        />
      )}
      <div className="bg-white p-6 rounded-xl shadow-lg sticky top-28 border">
        <h2 className="text-xl font-bold mb-5 text-gray-800">{existingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}</h2>
        {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{formError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Cari Alamat (Jalan, Gedung, Area)</label>
            <div className="relative">
              <input 
                type="text" 
                id="search" 
                value={searchQuery} 
                onChange={handleSearchChange} 
                placeholder="Mulai ketik alamat..." 
                autoComplete="off" 
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm" 
                required
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <PulseLoader size={6} color="#d93d41" />
                </div>
              )}
            </div>
            {suggestions.length > 0 && (
              <div className="border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto z-10 bg-white shadow-lg">
                {suggestions.map(s => ( 
                  <div 
                    key={s.place_id} 
                    onClick={() => handleSuggestionClick(s)} 
                    className="p-2.5 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    {s.display_name}
                  </div> 
                ))}
              </div>
            )}
          </div>
          <div>
            <label htmlFor="alias_name" className="block text-sm font-medium text-gray-700">Nama Alamat (Opsional)</label>
            <input
              type="text"
              name="alias_name"
              id="alias_name"
              placeholder="Contoh: Rumah, Kantor, Kos"
              value={formData.alias_name}
              onChange={handleChange}
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">Kota / Kabupaten</label>
              <input
                type="text" 
                name="city" 
                id="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="Otomatis terisi" 
                className="mt-1 block w-full p-2.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm" 
                required
              />
            </div>
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">Provinsi</label>
              <input
                type="text" 
                name="province" 
                id="province" 
                value={formData.province} 
                onChange={handleChange} 
                placeholder="Otomatis terisi" 
                className="mt-1 block w-full p-2.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm" 
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">Kode Pos</label>
            <input
              type="text" 
              name="postal_code" 
              id="postal_code" 
              value={formData.postal_code} 
              onChange={handleChange} 
              placeholder="Otomatis terisi" 
              className="mt-1 block w-full p-2.5 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:ring-[#d93d41] focus:border-[#d93d41] sm:text-sm" 
              required
            />
          </div>
          
          {/* --- TOMBOL BARU UNTUK PIN POINT --- */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700">Pin Point Lokasi</label>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex-grow p-2 border rounded-md bg-gray-50 text-xs text-gray-500">
                {formData.latitude ? `Lat: ${Number(formData.latitude).toFixed(5)}, Lng: ${Number(formData.longitude).toFixed(5)}` : "Belum ditentukan"}
              </div>
              <button type="button" onClick={() => setIsMapOpen(true)} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 text-sm">
                Pilih di Peta
              </button>
            </div>
          </div>

          {!existingAddress && (
            <div className="flex items-center">
              <input
                id="is_active" 
                name="is_active" 
                type="checkbox"
                className="h-4 w-4 text-[#d93d41] focus:ring-[#d93d41] border-gray-300 rounded"
                checked={formData.is_active} 
                onChange={handleChange}
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Jadikan Alamat Utama
              </label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="w-full bg-[#7c1215] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#a03236] disabled:opacity-70 flex items-center justify-center">
              {isSaving ? <PulseLoader size={8} color="#fff" /> : (existingAddress ? "Simpan Perubahan" : "Simpan Alamat")}
            </button>
            <button type="button" onClick={onCancel} className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-300">Batal</button>
          </div>
        </form>
      </div>
    </>
  );
};

const getStaticMapUrl = (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_TOKEN;
    if (!apiKey) { 
        console.warn("LocationIQ token for frontend not found in .env.local"); 
        return null; 
    }
    return `https://maps.locationiq.com/v3/staticmap?key=${apiKey}&center=${latitude},${longitude}&zoom=15&size=400x200&markers=icon:large-red-cutout|${latitude},${longitude}&format=jpg`;
};

const SavedAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formError, setFormError] = useState("");

  const router = useRouter();

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await addressAPI.getAll();
      setAddresses(response.data || []);
      if (response.data.length === 0) {
        setIsFormVisible(true);
      }
    } catch (err) {
      console.error("Gagal mengambil alamat:", err);
      setError("Tidak dapat memuat daftar alamat. Coba lagi nanti.");
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setIsAuthModalOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchAddresses();
    } else {
      setIsAuthModalOpen(true);
      setIsLoading(false);
    }
  }, [fetchAddresses]);

  const handleSaveAddress = async (formData) => {
    setIsSubmitting(true);
    setError(""); 
    setSuccess(""); 
    setFormError("");
    
    try {
      let responseMessage = "";
      const payload = {
        alias_name: formData.alias_name,
        address_text: formData.address_text,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postal_code,
        latitude: formData.latitude,
        longitude: formData.longitude,
        gmaps_place_id: formData.gmaps_place_id,
      };

      if (editingAddress) {
        const res = await addressAPI.update(editingAddress.address_id, payload);
        responseMessage = res.data.message || "Alamat berhasil diperbarui.";
      } else {
        payload.is_active = formData.is_active;
        const res = await addressAPI.add(payload);
        responseMessage = res.data.message || "Alamat baru berhasil ditambahkan.";
      }
      setSuccess(responseMessage);
      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error("Gagal menyimpan alamat:", err.response || err);
      setFormError(err.response?.data?.error || "Gagal menyimpan alamat.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setEditingAddress(null);
    setIsFormVisible(false);
    setFormError("");
  };

  const handleDelete = async (addressId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      const originalAddresses = [...addresses];
      setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
      try {
        await addressAPI.delete(addressId);
        setSuccess("Alamat berhasil dihapus.");
        if(editingAddress?.address_id === addressId) resetForm();
      } catch (err) {
        console.error("Gagal menghapus alamat:", err);
        setError(err.response?.data?.error || "Gagal menghapus alamat.");
        setAddresses(originalAddresses);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    const originalAddresses = addresses.map(addr => ({...addr}));
    setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_active: addr.address_id === addressId
    })));

    try {
      await addressAPI.setDefault(addressId);
      setSuccess("Alamat utama berhasil diubah.");
    } catch (err) {
      console.error("Gagal menjadikan alamat utama:", err);
      setError(err.response?.data?.error || "Gagal menjadikan alamat utama.");
      setAddresses(originalAddresses);
    }
  };

  const showNewAddressForm = () => {
    setEditingAddress(null);
    setIsFormVisible(true);
    setFormError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showEditForm = (address) => {
    setEditingAddress(address);
    setIsFormVisible(true);
    setFormError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-10">
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => {setIsAuthModalOpen(false); if(!localStorage.getItem('authToken')) router.push('/');}} />
      <div className="container mx-auto px-4 max-w-7xl"> {/* Lebarkan kontainer */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-[#7c1215] font-semibold flex items-center text-sm hover:text-[#a03236] transition-colors"
          >
            <FaArrowAltCircleLeft className="mr-2 text-3xl" /> <p className="text-base">Kembali</p>
          </button>
        </div>

        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {/* --- PERBAIKAN TATA LETAK UTAMA --- */}
        <div className="lg:flex lg:gap-8">
          
          {/* Kolom Form (Kiri) */}
          {/* Form akan selalu ada jika isFormVisible, atau jika tidak ada alamat sama sekali */}
          {(isFormVisible || (!isLoading && addresses.length === 0)) && (
            <div className="lg:w-1/3 mb-8 lg:mb-0">
                <AddressForm 
                    onSave={handleSaveAddress} 
                    onCancel={resetForm} 
                    existingAddress={editingAddress} 
                    isSaving={isSubmitting} 
                    formError={formError}
                />
            </div>
          )}

          {/* Kolom Daftar Alamat (Kanan) */}
          <div className={`${(isFormVisible || (!isLoading && addresses.length === 0)) ? 'lg:w-2/3' : 'w-full'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Daftar Alamat Tersimpan</h2>
              {/* Tombol tambah hanya muncul jika form tidak terlihat & sudah ada alamat */}
              {!isFormVisible && addresses.length > 0 && (
                 <button onClick={showNewAddressForm} className="bg-green-500 text-white py-2 px-3 sm:px-4 rounded-lg font-semibold hover:bg-green-600 flex items-center text-xs sm:text-sm">
                    <FaPlusCircle className="mr-1 sm:mr-2"/> Tambah Baru
                </button>
              )}
            </div>
            
            {isLoading && <div className="text-center py-10"><PulseLoader color="#D93D41" /></div>}
            
            {!isLoading && addresses.length === 0 && !isFormVisible && (
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <FaRegSadTear className="text-6xl text-gray-400 mx-auto mb-5" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Alamat Masih Kosong</h3>
                <p className="text-gray-500 mb-5">Sepertinya Anda belum menambahkan alamat. Tambahkan alamat pertama Anda sekarang!</p>
                <button
                    onClick={showNewAddressForm}
                    className="bg-[#d93d41] text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-[#b92d31] transition-colors flex items-center justify-center mx-auto"
                >
                   <FaPlusCircle className="mr-2"/> Tambah Alamat
                </button>
              </div>
            )}
            
            {/* Daftar alamat akan selalu ditampilkan */}
            {!isLoading && addresses.length > 0 && (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.address_id} className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 transition-all hover:shadow-xl ${address.is_active ? "border-green-500" : "border-transparent"}`}>
                    <div className="md:flex">
                        <div className="md:flex-shrink-0">
                            {getStaticMapUrl(address.latitude, address.longitude) ? (
                                <img 
                                  className="h-48 w-full object-cover md:w-48" 
                                  src={getStaticMapUrl(address.latitude, address.longitude)} 
                                  alt={`Peta untuk ${address.alias_name || address.address_text}`} 
                                />
                            ) : (
                                <div className="h-48 w-full md:w-48 bg-gray-200 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                    <FaMapMarkerAlt className="text-4xl"/>
                                    <span className="mt-2 text-xs">Lokasi GPS tidak tersedia</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 md:p-6 flex flex-col justify-between w-full">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow mr-2">
                                        {/* PERBAIKAN BUG "0": Gunakan '!!' untuk memastikan hasilnya boolean */}
                                        {!!address.is_active && (
                                            <span className="text-xs bg-green-100 text-green-800 font-semibold px-2.5 py-1 rounded-full mb-2 inline-block">Alamat Utama</span>
                                        )}
                                        {address.alias_name && <p className="uppercase tracking-wide text-sm text-[#d93d41] font-semibold">{address.alias_name}</p>}
                                        <p className="font-semibold text-gray-700 break-words">{address.address_text}</p>
                                        <p className="text-sm text-gray-500 break-words">{address.city}, {address.province}, {address.postal_code}</p>
                                    </div>
                                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                                        <button 
                                          onClick={() => showEditForm(address)}
                                          className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                                          title="Edit Alamat"
                                        >
                                          <FaEdit className="text-sm sm:text-base"/>
                                        </button>
                                        <button 
                                          onClick={() => handleDelete(address.address_id)}
                                          className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                          title="Hapus Alamat"
                                          disabled={isSubmitting}
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
                        </div>
                    </div>
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