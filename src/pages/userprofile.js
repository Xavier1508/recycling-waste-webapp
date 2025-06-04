import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import Navbar from "@/components/Navbar";
import styles from "@/style"; // Pastikan path ini benar
import UserProfile from "@/components/UserProfile";
import { useRouter } from "next/router";

// Nama file adalah 'userprofile.js', jadi nama komponen sebaiknya PascalCase
const UserProfilePage = () => {
  const [loading, setLoading] = useState(true); // Loading untuk proteksi route
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // Jika tidak ada token, arahkan ke login
      router.replace("/login");
    } else {
      // Jika ada token, berhenti loading (konten UserProfile akan handle loading datanya sendiri)
      setLoading(false);
    }
  }, [router]); // Dependency router untuk memastikan useEffect berjalan setelah router siap

  // Style untuk loader halaman
  const override = `
    display: block;
    margin: 0 auto;
  `;

  if (loading) {
    // Tampilkan loader selama pengecekan token
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

  // Jika sudah tidak loading (artinya token ada), tampilkan halaman profil
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className={`${styles.paddingX} ${styles.flexCenter} fixed top-0 left-0 right-0 z-30 bg-transparent`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>
      <UserProfile /> {/* Komponen UserProfile akan menangani loading datanya sendiri */}
    </div>
  );
};

export default UserProfilePage; // Pastikan export default menggunakan nama komponen yang benar
