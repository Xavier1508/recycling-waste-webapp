import React, { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, textVariant } from "../../utils/motion";

const LetsTalk = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex md:flex-row flex-col w-full md:space-x-12 space-x-0 space-y-6 items-center justify-center mx-auto md:py-24 py-18 pt-10 px-5">
      <div className="text-left w-full max-w-[500px] space-y-5">
        <h1 className="font-bold md:text-[44px] text-[#424242] text-[26px] leading-tight">
          Tell Us About Your Problem, Let’s Talk!
        </h1>
        <p className="font-normal text-paragraph md:text-[20px] text-[16px]">
          Lorem ipsum dolor sit amet consectetur. Posuere tortor id et
          adipiscing phasellus orci at. Tellus tempus morbi in pharetra nibh.
          Facilisis malesuada quis nam adipiscing. Sed tincidunt lacus ipsum
          lectus molestie dolor. Massa sit.
        </p>
      </div>
      <form
        initial="hidden"
        animate="visible"
        variants={inputVariants}
        className="w-full max-w-[500px] space-y-8"
        onSubmit={handleSubmit}
      >
        <div
          variants={inputVariants}
          className="flex items-center justify-between flex-wrap space-y-8 sm:space-y-0"
        >
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="border-b-2 font-light border-[#B1B1B1] md:w-[230px] sm:w-[200px] w-full outline-none py-2"
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="border-b-2 font-light border-[#B1B1B1] md:w-[230px] sm:w-[200px] w-full outline-none py-2"
            placeholder="Last Name"
          />
        </div>
        <input
          variants={inputVariants}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="Email Address"
          className="border-b-2 font-light border-[#B1B1B1] outline-none w-full py-2"
        />
        <input
          variants={inputVariants}
          type="number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          required
          placeholder="Phone Number"
          className="border-b-2 font-light border-[#B1B1B1] outline-none w-full py-2"
        />
        <input
          variants={inputVariants}
          type="text"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          placeholder="Message"
          className="border-b-2 font-light border-[#B1B1B1] outline-none w-full py-2"
        />

        <button
          variants={inputVariants}
          className="button text-white text-sm py-3 px-8"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LetsTalk;
