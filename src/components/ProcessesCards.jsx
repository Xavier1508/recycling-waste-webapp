import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  fadeIn,
  slideIn,
  staggerContainer,
  textVariant,
} from "../../utils/motion";
import { processesCards } from "@/constants";
import styles from "@/style";

const ProcessesCards = () => {
  return (
    <div
      className={`items-center ${styles.boxWidth} mx-auto px-5 relative py-20`}
    >
      <div
        className={`servicesBgFrame flex justify-center items-center bg-cover bg-center lg:max-w-[1220px] md:max-w-[950px] max-w-[500px] mx-auto md:h-[560px] h-[460px] rounded-2xl px-16 pb-5`}
        style={{ backgroundImage: "servicesBgFrame" }}
      ></div>

      <div
        className="flex justify-center gap-5 lg:flex-row flex-col space-y-5 items-center md:space-y-3 w-full lg:space-y-0 overflow-hidden h-full bottom-0 py-3"
        style={{ marginTop: "-8%" }}
      >
        {processesCards.map((card, id) => (
          <div
            style={{
              transition: "transform 0.3s ease",
              transform: "scale(1)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            className="w-full md:max-w-[370px] max-w-[330px] md:h-[360px] h-[310px] items-center bg-white border rounded-[25px] text-left shadow-md p-12 space-y-4"
          >
            <div className="bg-[#FDB400]/10 rounded-full w-full max-w-[70px] p-3">
              <Image src={card.img} className="" alt="" />
            </div>
            <h1 className="font-bold md:text-[24px] text-[18px] text-[#424242]">
              {card.title}
            </h1>
            <p className="text-paragraph md:text-[18px] text-[14px]">
              {card.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessesCards;
