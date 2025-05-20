import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "../../utils/motion";
import { helpingIndustriesImg, tick } from "@/assets";
import Image from "next/image";
const fiturLayananPoints = [
  "Jemput Sampah Langsung ke Rumah",
  "Jadwal Fleksibel",
  "Daur Ulang dan Pemilahan Sampah",
  "Pesan Mudah Lewat Chat atau Aplikasi",
  "Tukar Poin dengan Hadiah Menarik",
  "Lacak Sampah via Maps",
];

const RightImgLeftContent = () => {
  return (
    <div className="flex flex-wrap w-full md:space-x-12 space-x-0 space-y-6 items-center justify-center p-10 mx-auto">
      <div className="text-left w-full max-w-[450px] space-y-5">
        <h1 className="font-bold md:text-[28px] text-[22px]">
          Fitur Layanan Kami
        </h1>
        <p className="font-normal text-paragraph md:text-[20px] text-[16px]">
          Kami hadir untuk memudahkan pengelolaan sampah rumah tangga secara praktis, modern, dan ramah lingkungan. Cukup dari rumah, kamu bisa buang sampah tanpa ribet, sambil dapat manfaat tambahan seperti poin dan tracking lokasi.
        </p>
          <div className="space-y-2">
            {fiturLayananPoints.map((text, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Image src={tick} alt="Checklist icon" />
                <p className="text-paragraph md:text-[16px] text-[14px]">{text}</p>
              </div>
            ))}
          </div>
      </div>
      <div className="flex items-center justify-center">
        <Image
          src={helpingIndustriesImg}
          className="rounded-md w-full max-w-[420px] md:max-w-[520px] object-contain"
          alt=""
        />
      </div>
    </div>
  );
};

export default RightImgLeftContent;
