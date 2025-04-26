import React, { useState } from "react";
import Image from "next/image";
import { reviewStars, reviewStars2 } from "@/assets";

const TestimonialsCard = ({ content, name, img }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="flex justify-center space-x-3 flex-col md:space-x-5 md:flex-row space-y-5 md:space-y-0 items-center max-w-[420px] md:mx-auto cursor-pointer"
    >
      <div
        className={`w-full flex max-w-[425px] justify-center items-center h-full max-h-[375px] group transition-colors bgTestimonials space-x-5 rounded-[32px] md:py-5 py-3 px-5 ${
          hovered ? "hover:bg-white" : ""
        }`}
      >
        <div
          className={`w-full max-w-[80px] h-full max-h-[80px] flex justify-center items-center rounded-full transition-colors ${
            hovered ? "bg-white" : "bgRedGradient"
          }`}
        >
          <Image
            src={img}
            className="rounded-full transition-colors overflow-hidden"
            alt=""
          />
        </div>
        <div className="space-y-2">
          <div className="flex space-x-3 justify-start">
            <h1 className="font-semibold font-poppins text-black text-lg">
              {name}
            </h1>
            {hovered ? (
              <Image src={reviewStars} className="w-25 h-3.5 mt-1.5" alt="" />
            ) : (
              <Image src={reviewStars2} className="w-25 h-3.5 mt-1.5" alt="" />
            )}
          </div>
          <p
            className={`text-black text-left font-normal text-[13px] ${
              hovered ? "hovered-review" : ""
            }`}
          >
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCard;
