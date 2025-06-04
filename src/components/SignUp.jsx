import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authAPI } from "@/services/api"; // Pastikan path ini benar

const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "", // Tambahkan jika diperlukan oleh backend, atau gabungkan dengan first_name
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { first_name, last_name, phone_number, email, password, confirmPassword } = formData;

    if (!first_name || !phone_number || !email || !password || !confirmPassword) {
      setError("Semua field wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    // Sesuaikan payload dengan yang diharapkan backend (misal, jika hanya butuh 'name' bukan 'first_name' & 'last_name')
    // Untuk saat ini, saya asumsikan backend Anda menerima first_name, last_name, phone_number, email, password
    const userData = {
        first_name,
        last_name: last_name || '', // Jika last_name opsional atau tidak ada field terpisah
        phone_number,
        email,
        password,
    };

    try {
      const response = await authAPI.register(userData);
      // Asumsi backend mengembalikan token dan data user setelah registrasi berhasil
      // Jika backend hanya mengembalikan pesan sukses, arahkan ke login
      // Jika backend juga login otomatis:
      // localStorage.setItem("authToken", response.data.token);
      // localStorage.setItem("userData", JSON.stringify(response.data.user));
      // window.dispatchEvent(new CustomEvent("authChange"));
      // router.push("/");

      // Untuk saat ini, kita arahkan ke halaman login setelah registrasi sukses
      alert("Registrasi berhasil! Silakan login."); // Ganti dengan notifikasi yang lebih baik jika ada
      router.push("/login");

    } catch (err) {
      console.error("Registration failed:", err.response?.data?.error || err.message);
      setError(
        err.response?.data?.error || "Registrasi gagal. Coba lagi nanti."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex justify-center items-center flex-1 py-12">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#333]">
            Buat Akun Baru
          </h2>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Depan
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Nama Depan Anda"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
             <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Belakang (Opsional)
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Nama Belakang Anda"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nomor Handphone
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="08123456789"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email@anda.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kata Sandi
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Konfirmasi Kata Sandi
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Ulangi kata sandi"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Dengan melanjutkan, Anda setuju dengan{" "}
              <a href="#" className="underline hover:text-[#d93d41]">
                Ketentuan Penggunaan
              </a>{" "}
              dan{" "}
              <a href="#" className="underline hover:text-[#d93d41]">
                Kebijakan Privasi
              </a>
              .
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d93d41] text-white py-3 px-4 rounded-full font-semibold hover:bg-[#b92d31] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d93d41] disabled:opacity-50"
            >
              {isLoading ? "Mendaftar..." : "Daftar"}
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
  );
};

export default SignUp;
