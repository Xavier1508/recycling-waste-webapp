import CTA from "@/components/CTA";
import Cards from "@/components/Cards";
import Clients from "@/components/Clients";
import FAQs from "@/components/FAQs";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import LeftImgRightContent from "@/components/LeftImgRightContent";
import MeetTeam from "@/components/MeetTeam";
import Navbar from "@/components/Navbar";
import RightImgLeftContent from "@/components/RightImgLeftContent";
import Testimonials from "@/components/Testimonials";
import { useState, useEffect } from "react";
import styles from "@/style";
import { PropagateLoader } from "react-spinners";

export default function Home() {
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
          <PropagateLoader
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
            {/* Navbar */}
            <div
              className={`${styles.paddingX} ${styles.flexCenter} relative z-30`}
            >
              <div className={`${styles.boxWidth}`}>
                <Navbar />
              </div>
            </div>

            <div
              className={`${styles.flexStart} bg-cover homepageBg bg-no-repeat bg-center relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20 z-10 pointer-events-none">
                <div
                  className="absolute top-0 left-0 w-full bg-black opacity-30 h-full pointer-events-none"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 100px), 0 100%)",
                  }}
                />
              </div>

              <div className={`${styles.boxWidth} relative z-20`}>
                <Hero />
              </div>
            </div>
          </div>

          <Clients />
          <Cards />
          <LeftImgRightContent />
          <RightImgLeftContent />
          <MeetTeam />
          <Testimonials />
          <CTA />
          <FAQs />
          <Footer />
        </>
      )}
    </div>
  );
}
