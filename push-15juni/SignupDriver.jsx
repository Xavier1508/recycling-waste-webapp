import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authAPI } from "@/services/api";
import { FaUserCircle, FaCamera } from "react-icons/fa";
import DriverCodeModal from "./DriverCodeModal";

const SignUpDriver = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    license_number: "",
    license_expiry_date: "",
    license_plate: "",
    vehicle_type: "motorcycle_box",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDriverCodeModal, setShowDriverCodeModal] = useState(false);
  const [generatedDriverCode, setGeneratedDriverCode] = useState("");

  const router = useRouter();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Hanya file gambar yang diizinkan.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (!profilePictureFile) {
        setError("Foto profil wajib diunggah.");
        return;
    }

    setIsLoading(true);

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
        submissionData.append(key, formData[key]);
    });
    submissionData.append("profile_picture", profilePictureFile);

    try {
      const response = await authAPI.registerDriver(submissionData);
      
      setGeneratedDriverCode(response.data.driver_code);
      setShowDriverCodeModal(true);

    } catch (err) {
      console.error("Registration failed:", err.response?.data?.error || err.message);
      setError(
        err.response?.data?.error || "Registrasi gagal. Coba lagi nanti."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleModalClose = () => {
      setShowDriverCodeModal(false);
      router.push("/login");
  }

  return (
    <>
      <DriverCodeModal 
        isOpen={showDriverCodeModal}
        onClose={handleModalClose}
        driverCode={generatedDriverCode}
      />
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex justify-center items-center flex-1 py-12">
          <div className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center text-[#333]">
              Daftar Sebagai Mitra Driver
            </h2>
            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-4">
                  <div className="relative group w-32 h-32">
                      {profilePicturePreview ? (
                          <img src={profilePicturePreview} alt="Pratinjau Foto Profil" className="w-full h-full rounded-full object-cover border-4 border-gray-200" />
                      ) : (
                          <FaUserCircle className="w-full h-full text-gray-300" />
                      )}
                      <button
                          type="button"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          className="absolute bottom-1 right-1 bg-[#d93d41] text-white p-2 rounded-full hover:bg-[#b92d31] transition-all shadow-md"
                      >
                          <FaCamera />
                      </button>
                  </div>
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePictureChange}
                      accept="image/*"
                      className="hidden"
                      required
                  />
                   <label className="mt-2 text-sm font-medium text-gray-700">Upload Foto Profil (Wajib)</label>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <input name="first_name" type="text" placeholder="Nama Depan" value={formData.first_name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  <input name="last_name" type="text" placeholder="Nama Belakang" value={formData.last_name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  <input name="phone_number" type="tel" placeholder="Nomor Handphone" value={formData.phone_number} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  <input name="confirmPassword" type="password" placeholder="Konfirmasi Password" value={formData.confirmPassword} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  
                  {/* Driver & Vehicle Info */}
                  <input name="license_number" type="text" placeholder="Nomor SIM" value={formData.license_number} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  <div>
                    <label htmlFor="license_expiry_date" className="block text-xs font-medium text-gray-500 ml-1">Tanggal Habis Masa Berlaku SIM</label>
                    <input id="license_expiry_date" name="license_expiry_date" type="date" value={formData.license_expiry_date} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  </div>
                  <input name="license_plate" type="text" placeholder="Nomor Plat Kendaraan" value={formData.license_plate} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md" />
                  <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md bg-white">
                      <option value="motorcycle_box">Motor Roda Tiga (Box)</option>
                      <option value="small_truck">Truk Kecil (Pick-up)</option>
                      <option value="medium_truck">Truk Sedang</option>
                      <option value="bicycle_cart">Gerobak Sepeda</option>
                  </select>
              </div>

              <p className="text-xs text-center text-gray-500 pt-4">
                Dengan melanjutkan, Anda setuju dengan{" "}
                <a href="#" className="underline hover:text-[#d93d41]">
                  Ketentuan Kemitraan Driver
                </a>.
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#d93d41] text-white py-3 px-4 rounded-full font-semibold hover:bg-[#b92d31] disabled:opacity-50"
              >
                {isLoading ? "Mendaftar..." : "Daftar Menjadi Mitra"}
              </button>
            </form>
            <div className="mt-6 border-t pt-4 text-center text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-[#d93d41] hover:text-[#b92d31] underline">
                Login di sini
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SignUpDriver;
