import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { authAPI } from "@/services/api";
import { FaUser, FaCar } from "react-icons/fa";

const Login = () => {
  const [loginMode, setLoginMode] = useState("customer");
  const [credentials, setCredentials] = useState({
    email: "",
    driver_code: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const isCustomer = loginMode === "customer";
    const { email, driver_code, password } = credentials;

    if (isCustomer && (!email || !password)) {
      setError("Email dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    if (!isCustomer && (!driver_code || !password)) {
      setError("Kode Driver dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = isCustomer
        ? await authAPI.login(email, password)
        : await authAPI.loginDriver(driver_code, password);

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userData", JSON.stringify(response.data.user));

      window.dispatchEvent(new CustomEvent("authChange"));

      const userRole = response.data.user?.role;
      if (userRole === 'driver') {
        router.push("/driverprofile");
      } else {
        router.push("/userprofile");
      }

    } catch (err) {
      console.error("Login failed:", err.response?.data?.error || err.message);
      setError(
        err.response?.data?.error || "Login gagal. Periksa kembali kredensial Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderCustomerForm = () => (
    <>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="contoh@email.com"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
          value={credentials.email}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );

  const renderDriverForm = () => (
    <>
      <div>
        <label
          htmlFor="driver_code"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Kode Driver
        </label>
        <input
          id="driver_code"
          name="driver_code"
          type="text"
          placeholder="Contoh: XVR12345B1234XYZ"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
          value={credentials.driver_code}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex justify-center items-center flex-1">
        <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
          {/* Login Mode Toggler */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setLoginMode("customer")}
              className={`flex-1 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2 ${
                loginMode === "customer"
                  ? "border-b-2 border-[#d93d41] text-[#d93d41]"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FaUser /> Customer
            </button>
            <button
              onClick={() => setLoginMode("driver")}
              className={`flex-1 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2 ${
                loginMode === "driver"
                  ? "border-b-2 border-[#d93d41] text-[#d93d41]"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FaCar /> Mitra Driver
            </button>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-center text-[#333]">
            Log in sebagai {loginMode === 'customer' ? 'Customer' : 'Mitra Driver'}
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMode === "customer" ? renderCustomerForm() : renderDriverForm()}
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password Anda"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-[#d93d41] focus:border-[#d93d41]"
                value={credentials.password}
                onChange={handleChange}
                required
              />
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
            
            <p className="text-sm text-center mt-4">
              {loginMode === 'customer' ? 'Belum punya akun?' : 'Belum jadi mitra?'} {' '}
              <Link 
                href={loginMode === 'customer' ? "/signup" : "/signupdriver"} 
                className="font-semibold text-[#d93d41] hover:text-[#b92d31] underline">
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
