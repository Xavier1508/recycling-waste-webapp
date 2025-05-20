import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import Navbar from "@/components/Navbar";
import styles from "@/style";
import UserProfile from "@/components/UserProfile";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? (
        <div className="h-screen flex justify-center items-center bg-white">
          <PulseLoader color="#10B981" size={15} />
        </div>
      ) : (
        <>
          {/* Navbar */}
          <div className={`${styles.paddingX} ${styles.flexCenter} relative z-30`}>
            <div className={`${styles.boxWidth}`}>
              <Navbar />
            </div>
          </div>

          {/* User Profile Content */}
          <div className="pt-28 bg-[#22D94B]"></div>
          <UserProfile />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
