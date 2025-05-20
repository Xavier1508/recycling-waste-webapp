import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { slideIn, staggerContainer, textVariant } from "../../utils/motion";
import styles from "@/style";
import { stats } from "@/constants";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      className={`${styles.flexStart} flex-col text-left md:px-28 xl:px-18 px-4 md:h-[950px] h-[820px] space-y-8 mx-auto`}
    >
      <h1 className="text-white transition-colors font-poppins font-bold text-[28px] md:text-[40px] lg:text-[56px]">
        Trash Trade
      </h1>
      <p className="text-white text-left transition-colors font-poppins md:text-[18px] text-[14px] mt-4">
        Cukup pisahkan sampahmu dan buang pada tempatnya, sisanya kami yang urus. <br></br>
        Akan kami ubah sampahmu menjadi rupiah!
      </p>
      <Link href="contactus">
        <button className="button py-4 px-7 font-semibold md:text-[18px] text-[14px] text-white">
          Request Pengambilan Sekarang!
        </button>
      </Link>
      <div className="flex space-x-8 pt-10 px-3">
        {stats.map((stat, index) => (
          <div>
            <h1 className="text-white font-bold md:text-[32px] text-[26px]">
              <CountUp
                end={parseFloat(stat.value)}
                duration={5}
                separator=","
                suffix={stat.value.replace(/[\d.,]/g, "")}
              />
              <span className="text-[#A8852E]">+</span>
            </h1>

            <p className="text-white md:text-[18px] text-[14px] font-normal">
              {stat.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
