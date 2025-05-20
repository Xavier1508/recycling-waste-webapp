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

 const override = `
   display: block;
   margin: 0 auto;
 `;
 
   return (
     <div>
       {loading ? (
         <div className="sweet-loading bgRedGradient flex justify-center items-center h-screen">
           <PulseLoader
             color="#ffff"
             loading={loading}
             size={15}
             css={override}
             aria-label="Loading Spinner"
             data-testid="loader"
           />
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
          <div className="pt-28 bg-[#bf575a]"></div>
          <UserProfile />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
