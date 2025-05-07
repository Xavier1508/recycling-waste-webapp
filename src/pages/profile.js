import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import styles from "@/style";
import UserProfile from "@/components/UserProfile";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const userProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulate an API call to fetch user data
    const fetchData = async () => {
      const data = {
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",  // example avatar URL
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        points: 120,
        address: "123 Main St, Springfield, IL"
      };
      setUserData(data);
      setLoading(false);
    };

    setTimeout(fetchData, 1000); // Simulate a delay like fetching data
  }, []);

  const override = `
    display: block;
    margin: 0 auto;
  `;

  return (
    <div>
      {loading ? (
        <div className="sweet-loading bg-white flex justify-center items-center h-screen">
          <PulseLoader
            color="#21D121"
            loading={loading}
            size={15}
            css={override}
          />
        </div>
      ) : (
        <>
          <div>
            <div className={`${styles.paddingX} ${styles.flexCenter} relative z-30`}>
              <div className={`${styles.boxWidth}`}>
                <Navbar />
              </div>
            </div>
            <div className={`${styles.flexStart} bg-cover contactBg bg-no-repeat bg-center relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 z-10 pointer-events-none">
                <div
                  className="absolute top-0 left-0 w-full bg-black opacity-30 h-full pointer-events-none"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 100px), 0 100%)",
                  }}
                />
              </div>

              <div className={`${styles.boxWidth} relative z-20 mt-12`}> {/* Add margin-top here */}
                <UserProfile userData={userData} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default userProfile;
