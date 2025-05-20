import styles from "@/style";
import { motion } from "framer-motion";
import { navVariants } from "../../utils/motion";
import { logo } from "@/assets";
import { footerLinks, socialMedia } from "@/constants";
import Image from "next/image";
import Link from "next/link";

const Footer = () => (
  <footer
    className={`${styles.flexCenter} ${styles.paddingY} flex-col bg-black pt-10 py-10 md:px-20`}
  >
    <div className={`${styles.flexStart} flex-col md:flex-row w-full`}>
      <div className="md:w-[400px] ml-5 flex flex-col items-start md:mr-10 space-y-5">
        <Image
          src={logo}
          alt=""
          className="w-[100px] h-[100px] object-contain"
        />
        <p className="text-secondary md:text-[16px] text-[14px] mt-4 text-left">
          Kami selalu siap menyambut Anda! Untuk info terkini, promo, atau kabar terbaru, jangan lupa ikuti kami di media sosial.
        </p>
        <div className="flex flex-col items-start md:mt-0 mt-4 md:mb-0 mb-10">
          <p className="mb-2 md:mb-4 font-poppins font-normal text-white">
            Find Us on Social Media:
          </p>
          <div className="flex">
            {socialMedia.map((social, index) => (
              <Image
                key={social.id}
                src={social.icon}
                alt={social.id}
                className={`w-[30px] h-[30px] object-contain cursor-pointer border hover:bg-[#FFFAEC] transition-colors border-[#A8852E] p-1.5 rounded-full ${
                  index !== socialMedia.length - 1 ? "mr-4 md:mr-3" : "mr-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-evenly ml-5 md:ml-0 md:mt-0 mt-10 md:gap-6 gap-0">
        {footerLinks.map((footerlink) => (
          <div
            key={footerlink.title}
            className={`flex flex-col items-start ss:my-0 my-4 min-w-[150px]`}
          >
            <h4 className="font-medium text-[22px] leading-[27px] text-white">
              {footerlink.title}
            </h4>
            <ul className="list-none mt-4 items-start text-secondary">
              {footerlink.links.map((link, index) => (
                <li
                  key={link.name}
                  className={`font-normal flex items-start text-[14px] leading-[24px] text-dimWhite hover:text-secondary cursor-pointer ${
                    index !== footerlink.links.length - 1 ? "mb-4" : "mb-0"
                  }`}
                >
                  <Link href={link.link}>
                    <p>{link.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex-1.5 flex flex-col items-start md:mt-0 mt-10 md:ml-10 ml-5 md:mr-0 mr-5">
        <div className="flex flex-col items-start ss:my-0 my-4 w-full">
          <h4 className="font-medium text-[22px] leading-27 text-white">
            Newsletter
          </h4>
          <p className="text-secondary mt-2 font-normal text-[16px] pb-5">
            Stay Up To Date
          </p>
        </div>
        <div className="flex space-x-2">
          <input
            type="email"
            className="rounded-full border bg-white px-4 py-2 w-full max-w-[220px] text-sm outline-none font-extralight"
            placeholder="Your email"
          />
          <button className="button py-2 px-4 md:px-6 text-white">
            Subscribe
          </button>
        </div>
      </div>
    </div>

    <div className="w-full items-center md:flex-row flex-col pt-6 border-t-[1px] border-t-[#3F3E45] mt-20">
      <p className="text-center text-[14px] leading-[27px] text-white">
        © 2025 TrashTrade. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
