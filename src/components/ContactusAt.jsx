import React from "react";
import { motion } from "framer-motion";
import { navVariants } from "../../utils/motion";
import { contactusImg } from "@/assets";
import { socialMedia } from "@/constants";
import Image from "next/image";

const ContactusAt = () => {
  return (
    <>
      <div className="flex flex-wrap items-center md:justify-center justify-start p-10 mt-10 gap-5">
        <div className="mb-6 md:mr-12">
          <Image
            src={contactusImg}
            className="rounded-3xl w-full max-w-[450px] md:max-w-[520px] object-contain"
            alt=""
          />
        </div>
        <div className="text-left w-full max-w-[450px] space-y-3">
          <h1 className="font-bold md:text-[44px] text-[26px] text-[#424242]">
            Hubungi Kami Secara Langusung
          </h1>
          <p className="font-normal text-paragraph md:text-[18px] text-[14px]">
            Alamat: <br />
            Jl. Raya Kb. Jeruk No.27, Kb. Jeruk, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11540
          </p>
          <div className="font-normal text-paragraph md:text-[18px] text-[14px] space-y-5">
            <div>
              <p>Phone Number:</p>
              <p>0564891-564984 | 0564891-564984</p>
            </div>
            <div>
              <p>Email:</p>
              <p>trashtrade12345@zmgt.com</p>
            </div>
            <div className="flex flex-col items-start md:mt-0 mt-4 md:mb-0 mb-10">
              <p className="mb-2 md:mb-4 font-poppins font-normal text-[#898989F]">
                Find Us on Social Media:
              </p>
              <div className="flex">
                {socialMedia.map((social, index) => (
                  <Image
                    key={social.id}
                    src={social.icon}
                    alt={social.id}
                    className={`w-[30px] h-[30px] object-contain cursor-pointer border hover:bg-[#d6c69b] transition-colors border-[#A8852E] p-1.5 rounded-full ${
                      index !== socialMedia.length - 1 ? "mr-4 md:mr-3" : "mr-0"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactusAt;
