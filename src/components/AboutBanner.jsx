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
        Service Excellence In
        <br />
        Waste Management
      </h1>
      <p className="text-white text-left transition-colors font-poppins text-[16px] md:text-[18px] mt-4">
        Lorem ipsum dolor sit amet consectetur. Velit at faucibus eleifend
        netus. Sagittis aliquam in nullam sit dolor arcu.
      </p>
    </section>
  );
};

export default aboutBanner;
