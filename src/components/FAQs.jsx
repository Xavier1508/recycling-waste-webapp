import { arrowDown } from "@/assets";
import { faqs } from "@/constants";
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.5 } },
};

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 my-20">
      <h1 className="font-bold text-3xl text-center md:text-4xl text-[#424242] mb-16">
        Frequently Asked Questions
      </h1>
      {faqs.map((faq, index) => (
        <div
          key={index}
          onClick={() => toggleAccordion(index)}
          className={`w-full flex flex-col items-start text-left rounded-[24.04px] py-6 px-6 my-5 ${
            activeIndex === index
              ? "bgRedGradient text-white rounded-[38.464px]"
              : "bg-[#fffaec] text-black rounded-[24.464px]"
          }`}
        >
          <div className="flex flex-row items-center justify-between w-full cursor-pointer">
            <h2 className="sm:text-lg text-base font-semibold md:text-2xl mb-4 md:mb-0">
              {faq.question}
            </h2>
            <Image
              src={arrowDown}
              alt=""
              className={`md:ml-4 w-full max-w-[20px] cursor-pointer transform transition-transform ${
                activeIndex === index ? "rotate-180" : "rotate-0"
              } ${activeIndex === index ? "invert" : ""}`}
            />
          </div>
          <motion.div
            className="mt-4"
            variants={containerVariants}
            initial="hidden"
            animate={activeIndex === index ? "visible" : "hidden"}
          >
            <p className="md:text-[16px] text-[14px] font-light">
              {faq.answer}
            </p>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default FAQs;
