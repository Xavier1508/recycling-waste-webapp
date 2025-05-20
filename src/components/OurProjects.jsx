import { projectFour, projectOne, projectThree, projectTwo } from "@/assets";
import Image from "next/image";
import React from "react";

const OurProjects = () => {
  return (
    <>
      <div className="space-y-5 flex flex-col items-center py-12 my-5 px-3">
        <h1 className="md:text-[36px] text-[28px] font-bold text-[#424242]">
          Proyek Sukses Kami
        </h1>
        <p className="text-paragraph text-center w-full max-w-[640px] md:text-[18px] text-[14px]">
          Kami telah menyelesaikan berbagai proyek pengelolaan limbah dengan hasil yang memuaskan, baik untuk skala rumah tangga, komersial, maupun industri. Setiap proyek mencerminkan komitmen kami terhadap kualitas layanan, kepatuhan regulasi, dan kepedulian terhadap lingkungan.
        </p>
      </div>
      <div className="flex md:flex-row flex-col gap-5 md:py-4 py-2 justify-center items-center md:px-6 px-3">
        <div
          style={{
            transition: "transform 0.3s ease",
            transform: "scale(1)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Image src={projectOne} className="rounded-3xl" alt="" />
        </div>
        <div
          style={{
            transition: "transform 0.3s ease",
            transform: "scale(1)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Image src={projectTwo} className="rounded-3xl" alt="" />
        </div>
      </div>
      <div
        style={{
          transition: "transform 0.3s ease",
          transform: "scale(1)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        className="flex md:flex-row flex-col gap-5 md:py-4 py-2 justify-center items-center px-3"
      >
        <div
          style={{
            transition: "transform 0.3s ease",
            transform: "scale(1)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Image src={projectThree} className="rounded-3xl" alt="" />
        </div>
        <div
          style={{
            transition: "transform 0.3s ease",
            transform: "scale(1)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Image src={projectFour} className="rounded-3xl" alt="" />
        </div>
      </div>
    </>
  );
};

export default OurProjects;
