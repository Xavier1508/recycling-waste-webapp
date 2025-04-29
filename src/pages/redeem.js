import Navbar from "@/components/Navbar";
import styles from "@/style";
import React, { useEffect, useState } from "react";
import ContactBanner from "@/components/ContactBanner";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { PulseLoader } from "react-spinners";
import RedeemSection from "@/components/RedeemSection";

const Redeem = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
          <div>
            <div
              className={`${styles.paddingX} ${styles.flexCenter} relative z-30`}
            >
              <div className={`${styles.boxWidth}`}>
                <Navbar />
              </div>
            </div>

            <div
              className={`${styles.flexStart} bg-cover contactBg bg-no-repeat bg-center relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 z-10 pointer-events-none">
                <div
                  className="absolute top-0 left-0 w-full bg-black opacity-30 h-full pointer-events-none"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 100px), 0 100%)",
                  }}
                />
              </div>

              <div className={`${styles.boxWidth} relative z-20`}>
                <ContactBanner />
              </div>
            </div>
          </div>
          <RedeemSection />
          <Footer />
        </>
      )}
    </div>
  );
};

export default Redeem;