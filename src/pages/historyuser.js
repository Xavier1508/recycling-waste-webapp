import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import History from "@/components/History";
import Navbar from "@/components/Navbar"; // Tambahkan Navbar
import styles from "@/style"; // Pastikan path ini benar
import { useRouter } from "next/router";

const HistoryUserPage = () => { // Ubah nama komponen menjadi PascalCase
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
    } else {
      setPageLoading(false);
    }
    // Simulasi loading halaman
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, [router]);

  const override = {
    display: "block",
    margin: "0 auto",
  };

  if (pageLoading) {
    return (
      <div className="sweet-loading bg-gray-100 flex justify-center items-center h-screen">
        <PulseLoader
          color="#D93D41"
          loading={pageLoading}
          size={15}
          cssOverride={override}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
        {/* Navbar Fixed */}
        <div className={`${styles.paddingX} ${styles.flexCenter} fixed top-0 left-0 right-0 z-30 bg-transparent`}>
            <div className={`${styles.boxWidth}`}>
                <Navbar />
            </div>
        </div>
        {/* Konten History dengan padding atas untuk Navbar */}
        <div className="pt-20 md:pt-24">
            <History />
        </div>
    </div>
  );
};

export default HistoryUserPage; // Gunakan nama komponen PascalCase
