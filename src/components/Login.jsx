import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authAPI } from "@/services/api"; // Pastikan path ini benar
// import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"; // Jika ingin toggle password

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [showPassword, setShowPassword] = useState(false); // State untuk toggle password
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error sebelum submit baru
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(email, password);
      // Asumsi backend mengembalikan token dan data user dalam `response.data`
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.user));

      // Kirim event untuk memberitahu Navbar atau komponen lain bahwa status auth berubah
      window.dispatchEvent(new CustomEvent("authChange"));

      router.push("/"); // Arahkan ke homepage setelah login berhasil
    } catch (err) {
      console.error("Login failed:", err.response?.data?.error || err.message);
      setError(
        err.response?.data?.error || "Login gagal. Periksa kembali email dan password Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex justify-center items-center flex-1">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-[#333]">
            Log in
          </h2>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="contoh@email.com"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password" // Ganti ke type={showPassword ? "text" : "password"} jika pakai toggle
                  placeholder="Password Anda"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* // Tombol untuk toggle password visibility
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button> 
                */}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-[#d93d41] focus:ring-[#d93d41] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-[#d93d41] hover:text-[#b92d31]">
                Lupa password?
              </a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d93d41] text-white py-3 px-4 rounded-full font-semibold hover:bg-[#b92d31] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d93d41] disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Login"}
            </button>
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
            <p className="text-sm text-center mt-4">
              Belum punya akun?{" "}
              <Link href="/signup" className="font-semibold text-[#d93d41] hover:text-[#b92d31] underline">
                  Daftar di sini
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
