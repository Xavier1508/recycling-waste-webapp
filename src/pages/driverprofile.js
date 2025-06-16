import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import Navbar from "@/components/Navbar";
import styles from "@/style";
import DriverProfile from "@/components/DriverProfile";
import { useRouter } from "next/router";

const DriverProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("userData");
    
    if (!token || !userDataString) {
      router.replace("/login");
      return;
    }
    
    try {
        const userData = JSON.parse(userDataString);
        // Pastikan hanya driver yang bisa mengakses halaman ini
        if (userData.role !== 'driver') {
            router.replace("/userprofile"); // Redirect non-driver ke profil user
        } else {
            setLoading(false);
        }
    } catch(e) {
        // Jika data user korup, paksa logout
        localStorage.clear();
        router.replace("/login");
    }

  }, [router]);

  if (loading) {
    return (
      <div className="sweet-loading bg-gray-100 flex justify-center items-center h-screen">
        <PulseLoader
          color="#D93D41"
          loading={loading}
          size={15}
          cssOverride={{ display: "block", margin: "0 auto" }}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className={`${styles.paddingX} ${styles.flexCenter} fixed top-0 left-0 right-0 z-30 bg-transparent`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>
      <DriverProfile />
    </div>
  );
};

export default DriverProfilePage;
