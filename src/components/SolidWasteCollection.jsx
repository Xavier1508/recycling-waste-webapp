import { tick, wastecollectionImg } from "@/assets";
import Image from "next/image";
import React from "react";
import { fadeIn, staggerContainer, textVariant } from "../../utils/motion";
import { motion } from "framer-motion";
const solidWastePoints = [
  "Pengangkutan limbah secara berkala dengan armada profesional.",
  "Pengumpulan dari berbagai jenis sumber (rumah, kantor, industri).",
  "Penanganan limbah non-berbahaya dan berbahaya sesuai ketentuan.",
  "Pemilahan awal untuk efisiensi proses lanjutan.",
  "Layanan fleksibel yang dapat disesuaikan dengan kebutuhan pelanggan.",
];

const SolidWasteCollection = () => {
  return (
    <>
      <div className="flex flex-wrap w-full md:space-x-12 space-x-0 space-y-6 items-center justify-center p-10 mx-auto">
        <div className="text-left w-full max-w-[450px] space-y-5 justify-start">
          <h1 className="font-bold md:text-[38px] text-[22px]">
            Solid Waste Collection
          </h1>
          <p className="font-normal text-paragraph md:text-[20px] text-[16px]">
            Layanan pengumpulan limbah padat yang andal dan terjadwal untuk rumah tangga, bisnis, dan fasilitas umum.
          </p>
            <div className="space-y-2">
              {solidWastePoints.map((text, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Image src={tick} alt="Checklist icon" />
                  <p className="text-paragraph md:text-[16px] text-[14px]">{text}</p>
                </div>
              ))}
            </div>
        </div>
        <div className="flex items-center justify-center">
          <Image
            src={wastecollectionImg}
            className="rounded-2xl w-full max-w-[420px] md:max-w-[520px] object-contain"
            alt=""
          />
        </div>
      </div>
    </>
  );
};

export default SolidWasteCollection;
