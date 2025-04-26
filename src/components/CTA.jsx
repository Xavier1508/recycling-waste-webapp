import Link from "next/link";
import React from "react";

const CTA = () => {
  return (
    <section className="bgFrame bg-no-repeat bg-center w-full flex justify-center items-center max-w-[1200px] h-[460px] sm:rounded-[25px] rounded-none lg:rounded-[25px] mx-auto mb-14">
      <div className="py-10 px-4 sm:py-16 lg:px-6 space-y-5 text-center text-white">
        <h2 className="mb-4 md:text-[32px] text-[24px] font-bold space-x-2">
          A leading Commercial And Waste Management
        </h2>
        <h3 className="mb-4 md:text-[32px] text-[24px] font-bold space-x-2">
          Services Provider For 30 Years!!
        </h3>
        <p className="mb-6 font-normal text-[16px] md:text-lg pb-8">
          Lorem ipsum dolor sit amet consectetur. Porttitor dictumst in ultrices
          proin gravida. Aenean at.
        </p>
        <Link href="contactus">
          <button className="text-black md:text-[18px] text-[12px] bg-white hover:bg-dimWhite transition-colors font-bold rounded-full text-sm px-6 md:px-10 py-3.5 inline-block">
            Contact Us
          </button>
        </Link>
      </div>
    </section>
  );
};

export default CTA;
