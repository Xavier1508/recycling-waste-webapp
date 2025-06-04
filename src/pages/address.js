import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import SavedAddress from "@/components/SavedAddress";
import Navbar from "@/components/Navbar"; // Navbar akan ditampilkan di sini
import styles from "@/style"; // Pastikan path ini benar
import { useRouter } from "next/router";

const AddressPage = () => { // Ubah nama komponen menjadi PascalCase
  const [pageLoading, setPageLoading] = useState(true); // Loading untuk proteksi route
  const router = useRouter();

  useEffect(() => {
    // Cek token untuk proteksi route sederhana
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login"); // Arahkan ke login jika tidak ada token
    } else {
      setPageLoading(false);
    }

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
        <div className={`${styles.paddingX} ${styles.flexCenter} fixed top-0 left-0 right-0 z-30 bg-transparent`}>
            <div className={`${styles.boxWidth}`}>
                <Navbar />
            </div>
        </div>
        <div className="pt-20 md:pt-24">
            <SavedAddress />
        </div>
    </div>
  );
};

export default AddressPage;
