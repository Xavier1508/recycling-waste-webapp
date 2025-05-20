import React from "react";
import { motion } from "framer-motion";
import {
  fadeIn,
  slideIn,
  staggerContainer,
  textVariant,
} from "../../utils/motion";
import styles from "@/style";
import { servicesCards } from "@/constants";
import Image from "next/image";
import Link from "next/link";

const Cards = () => {
  return (
    <>
      <div
        className={`items-center ${styles.boxWidth} mx-auto relative overflow-x-hidden`}
      >
        <div
          className={`bgFrame hidden !bg-center overflow-x-hidden w-full md:flex flex-col md:flex-row md:justify-between lg:max-w-[1220px] md:max-w-[950px] max-w-[500px] items-center md:h-[380px] h-[460px] rounded-2xl px-12 mb-5 mx-auto ${styles.marginY} pb-5`}
        >
          <h1
            className={`text-white font-bold md:text-[32px]  text-center md:text-left ${styles.marginY}`}
          >
            Layanan yang Sesuai
            <br /> dengan Kebutuhan Anda
          </h1>
          <p
            className={`text-white ${styles.marginY} md:text-[18px] text-[16px] w-[520px] text-center md:text-left`}
          >
            Kami menyediakan berbagai layanan pengelolaan limbah yang dirancang untuk memenuhi kebutuhan rumah tangga, industri, dan lingkungan secara efisien dan bertanggung jawab.
          </p>
        </div>

        <div
          className="flex justify-center gap-5 lg:flex-row flex-col space-y-5 items-center md:space-y-3 w-full lg:space-y-0 overflow-hidden h-full bottom-0 py-3"
          style={{ marginTop: "-7%" }}
        >
          {servicesCards.map((card, id) => (
            <div
              style={{
                transition: "transform 0.3s ease",
                transform: "scale(1)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              className="w-full md:max-w-[370px] max-w-[340px] h-full items-center bg-white border rounded-[25px] text-left shadow-md p-12 space-y-5"
            >
              <div className="bg-[#FDB400]/10 rounded-full w-full max-w-[70px] p-3">
                <Image src={card.img} className="" alt="" />
              </div>
              <h1 className="font-bold md:text-[20px] text-[18px] text-[#424242]">
                {card.title}
              </h1>
              <p className="text-paragraph md:text-[16px] text-[14px] pb-5">
                {card.content}
              </p>
              <Link href="services">
                <button className="uppercase text-[#7C1215] font-bold text-[14px] md:text-[18px] underline">
                  read more
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Cards;
