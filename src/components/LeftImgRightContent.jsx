import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "../../utils/motion";
import { servicesImg } from "@/assets";
import Image from "next/image";
import Link from "next/link";

const LeftImgRightContent = () => {
  return (
    <div className="flex flex-wrap items-center justify-center p-10 mt-10 gap-5 overflow-x-hidden">
      <div className="mb-6 md:mr-12">
        <Image
          src={servicesImg}
          className="rounded-3xl w-full max-w-[400px] md:max-w-[520px] object-contain"
          alt=""
        />
      </div>
      <div className="text-left w-full max-w-[450px] space-y-5">
        <h1 className="font-bold md:text-[28px] text-[22px]">
          Helping Different Industries And Facilities
        </h1>
        <p className="font-normal text-paragraph md:text-[20px] text-[16px]">
          Lorem ipsum dolor sit amet consectetur. Scelerisque amet at sem sit
          sit sed a. Eros est massa habitasse quisque.
        </p>
        <Link href="#">
          <button className="button text-white text-sm py-3 px-6 mt-5">
            Learn More
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LeftImgRightContent;
