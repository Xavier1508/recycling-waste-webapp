import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import Login from "@/components/Login"; // Menggunakan komponen Login.jsx
// Tidak perlu Navbar dan Footer di sini jika Login.jsx sudah merupakan halaman penuh

const LoginPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading halaman
    const timer = setTimeout(() => setLoading(false), 500); // Kurangi waktu loading jika perlu
    return () => clearTimeout(timer);
  }, []);

  // Style untuk loader
  const override = `
    display: block;
    margin: 0 auto;
  `;

  return (
    <div>
      {loading ? (
        <div className="sweet-loading bg-white flex justify-center items-center h-screen">
          <PulseLoader
            color="#D93D41" // Warna disesuaikan dengan tema
            loading={loading}
            size={15}
            cssOverride={{ display: "block", margin: "0 auto" }} // Menggunakan cssOverride
          />
        </div>
      ) : (
        <Login /> // Komponen Login akan menangani UI dan logika form
      )}
    </div>
  );
};

export default LoginPage;
