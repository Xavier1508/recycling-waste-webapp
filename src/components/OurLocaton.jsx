import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "../../utils/motion";
import { workingHours } from "@/constants";
import { tick } from "@/assets";
import Image from "next/image";

const OurLocaton = () => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-wrap w-full md:space-x-12 space-x-0 space-y-6 items-center justify-center p-10 mx-auto m"
    >
      <motion.div
        variants={fadeIn("down", "tween", 0.2, 1)}
        className="text-left w-full max-w-[450px] space-y-5"
      >
        <motion.h1
          variants={textVariant(1.1)}
          className="font-bold md:text-[38px] text-[22px]"
        >
          Lokasi & Jam Kerja Kami
        </motion.h1>
        <motion.p
          variants={textVariant(1.2)}
          className="font-normal text-paragraph md:text-[20px] text-[16px]"
        >
          Kantor kami siap melayani anda dari hari Senin hingga Jumat dengan jam operasional yang tetap. Kami berlokasi strategis dan mudah diakses, siap membantu segala kebutuhan dan pertanyaan anda. Jangan ragu untuk menghubungi atau mengunjungi kami pada jam kerja berikut:
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {workingHours.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeIn("left", "tween", 0.2, 1)}
              className="flex justify-start gap-10"
            >
              <Image src={tick} className="w-[20px] h-[20px]" alt="" />
              <p className="text-paragraph md:text-[18px] text-[12px] flex text-left">
                {item.day}
              </p>
              <p className="text-paragraph md:text-[18px] text-[12px]">
                {item.timing}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      <motion.div
        variants={fadeIn("right", "tween", 0.2, 1)}
        className="flex items-center justify-center w-full max-w-[500px]"
      >
        <iframe
          width="480"
          height="350"
          loading="lazy"
          className="rounded-[32px] h-[280px] md:h-[350px]"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3866.7649960349495!2d123.580123!3d-10.164123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3ALasiana!2sKupang!5e0!3m2!1sen!2sus!4vYOUR_MAP_ID"
        ></iframe>
      </motion.div>
    </motion.div>
  );
};

export default OurLocaton;
