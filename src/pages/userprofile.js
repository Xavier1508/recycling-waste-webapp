import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import Navbar from "@/components/Navbar";
import styles from "@/style";
import UserProfile from "@/components/UserProfile";
import { useRouter } from "next/router";

const UserProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  const override = `
    display: block;
    margin: 0 auto;
  `;

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
      <UserProfile />
    </div>
  );
};

export default UserProfilePage;