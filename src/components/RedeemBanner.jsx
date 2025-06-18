import styles from "@/style";
import React from "react";

const RedeemBanner = () => {
  return (
    <section
      className={`${styles.flexStart} flex-col text-left md:px-28 xl:px-18 px-4 md:h-[950px] h-[820px] space-y-3 mx-auto`}
    >
      <h1 className="text-white transition-colors text-left font-poppins font-bold text-[28px] md:text-[38px] lg:text-[56px]">
        Redeem Your Points
        <br />
        Get Your Reward
      </h1>
      <p className="text-white text-left transition-colors font-poppins text-[16px] md:text-[18px] mt-4">
        Tukarkan poin hasil daur ulangmu dan dapatkan hadiah menarik sebagai bentuk apresiasi atas kontribusimu!
      </p>
    </section>
  );
};

export default RedeemBanner;
