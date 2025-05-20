import styles from "@/style";
import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, textVariant } from "../../utils/motion";

const aboutBanner = () => {
  return (
    <section
      className={`${styles.flexStart} flex-col text-left md:px-28 xl:px-18 px-4 md:h-[950px] h-[820px] space-y-3 mx-auto`}
    >
      <h1 className="text-white transition-colors font-poppins font-bold text-[28px] md:text-[38px] lg:text-[56px]">
        Keunggulan Layanan kami
        <br />
        dalam Pengelolaan Limbah
      </h1>
      <p className="text-white text-left transition-colors font-poppins text-[16px] md:text-[18px] mt-4">
        Kami menghadirkan solusi pengelolaan limbah yang profesional, <br /> 
        terjadwal, dan ramah lingkungan untuk kebutuhan rumah tangga, bisnis, dan industri.
      </p>
    </section>
  );
};

export default aboutBanner;
