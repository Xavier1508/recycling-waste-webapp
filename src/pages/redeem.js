// pages/reedem.js
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import ReedemBanner from "@/components/ReedemBanner";
import RedeemSection from "@/components/RedeemSection";
import styles from "@/style";
import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";

const reedem = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(delay); 
  }, []);

  const override = `
    display: block;
    margin: 0 auto;
  `;

  return (
    <div>
      {loading ? (
        <div className="sweet-loading bgRedGradient flex justify-center items-center h-screen">
          <PulseLoader color="#fff" loading={loading} size={15} css={override} />
        </div>
      ) : (
        <>
          <div className={`${styles.paddingX} ${styles.flexCenter} relative z-30`}>
            <div className={`${styles.boxWidth}`}>
              <Navbar />
            </div>
          </div>

          <div className="relative z-20">
            {/* <ReedemBanner /> */}
          </div>
          <RedeemSection />
          <CTA />
          <Footer />
        </>
      )}
    </div>
  );
};

export default reedem;
