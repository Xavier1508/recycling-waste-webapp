import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "../../utils/motion";
import { tick, wastecollectionImg } from "@/assets";
import Image from "next/image";
const liquidWastePoints = [
  "Pengangkutan limbah cair dari industri dan rumah tangga.",
  "Penanganan limbah B3 cair dengan standar keselamatan tinggi.",
  "Sistem penyimpanan dan transportasi yang tertutup dan higienis.",
  "Kerja sama dengan fasilitas pengolahan limbah cair berizin.",
  "Monitoring volume dan kualitas limbah secara rutin.",
];

const LiquidWasteCollection = () => {
  return (
    <>
      <div className="flex flex-wrap w-full md:space-x-12 space-x-5 space-y-6 items-center justify-center p-10 mx-auto">
        <div className="flex items-center justify-center">
          <Image
            src={wastecollectionImg}
            className="rounded-2xl w-full max-w-[420px] md:max-w-[520px] object-contain"
            alt=""
          />
        </div>
        <div className="text-left w-full max-w-[450px] space-y-5">
          <h1 className="font-bold md:text-[38px] text-[22px]">
            Liquid Waste Collection
          </h1>
          <p className="font-normal text-paragraph md:text-[20px] text-[16px]">
            Pengelolaan limbah cair secara aman dan sesuai regulasi untuk melindungi lingkungan serta kesehatan masyarakat.
          </p>
            <div className="space-y-2">
              {liquidWastePoints.map((text, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Image src={tick} alt="Checklist icon" />
                  <p className="text-paragraph md:text-[16px] text-[14px]">{text}</p>
                </div>
              ))}
            </div>
        </div>
      </div>
    </>
  );
};

export default LiquidWasteCollection;
