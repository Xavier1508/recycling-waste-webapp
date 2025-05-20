import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "../../utils/motion";
import Image from "next/image";
import { aboutSectionImg } from "@/assets";

const AboutSection = () => {
  return (
    <section className="bgFrame bg-cover bg-no-repeat !bg-center space-y-8 md:space-y-0 gap-8 mx-auto rounded-none md:rounded-[25px] w-full md:max-w-[1200px] max-w-[500px] my-14 flex flex-col items-center justify-around md:flex-row h-full py-10 px-10">
      <div className="text-left space-y-3 w-full max-w-[500px]">
        <h1 className="md:text-[44px] text-[34px] font-bold text-white">
          Tentang Kami
        </h1>
        <p className="text-white text-[14px] md:text-[18px]">
          Kami adalah penyedia layanan pengelolaan limbah yang mengutamakan profesionalisme, keberlanjutan, dan kepuasan pelanggan. Dengan tim berpengalaman dan dukungan teknologi yang andal, kami melayani kebutuhan pengelolaan limbah dari rumah tangga, bisnis, hingga industri. Kami percaya bahwa pengelolaan limbah yang tepat bukan hanya soal kebersihan, tetapi juga tanggung jawab sosial dan lingkungan.
        </p>
        <p className="text-white text-[14px] md:text-[18px]">
          Kami menawarkan layanan menyeluruh mulai dari pengumpulan limbah padat dan cair, proses daur ulang, hingga edukasi masyarakat tentang pentingnya pemilahan limbah. Komitmen kami adalah memberikan solusi ramah lingkungan yang efisien, aman, dan sesuai regulasi, guna menciptakan masa depan yang lebih bersih dan berkelanjutan.
        </p>
      </div>
      <Image
        className="w-full max-w-[450px] h-full rounded-3xl max-h-[400px]"
        src={aboutSectionImg}
        alt=""
      />
    </section>
  );
};

export default AboutSection;
