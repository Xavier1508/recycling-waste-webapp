import { useState, useEffect } from "react";
import { navVariants } from "../../utils/motion";
import { close, logo, menu } from "@/assets";
import Link from "next/link";
import { navLinks } from "@/constants";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";


const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      setIsSticky(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`w-full overflow-x-visible md:px-28 px-4 flex md:py-4 py-3 justify-center items-center absolute top-0 left-0 z-10  ${
        isSticky ? "sticky-navbar" : ""
      }`}
    >
      <Link href="/">
        <Image
          src={logo}
          alt="zmgt"
          className="w-[100px] h-[90px] cursor-pointer mr-20"
        />
      </Link>
      <ul className="list-none md:flex hidden justify-center items-center text-[18px] flex-1 nav-desktop">
        {navLinks.map((nav, index) => (
          <li key={nav.id} className={`font-poppins`}>
            <Link
              href={`${nav.id}`}
              className={`font-poppins font-normal hover:text-dimWhite transition-colors cursor-pointer text-[16px]
          ${index === navLinks.length - 1 ? "mr-0" : "mr-10"} text-white`}
            >
              {nav.title}
            </Link>
          </li>
        ))}
      </ul>
      <div className="space-x-4 md:flex hidden">
        <Link
          href="/login"  // <-- updated from mailto:abc@gmail.com
          className="button flex-shrink-0 transition-colors text-white py-3 px-6 font-medium text-[18px] font-poppins"
>
          Login
        </Link>
      </div>

      <div className="md:hidden flex flex-1 justify-end items-center">
        <Image
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain cursor-pointer"
          onClick={() => setToggle((prev) => !prev)}
        />
        <div
          className={`${
            toggle ? "flex" : "hidden"
          } p-10 bg-black absolute top-20 right-0 mx-4 my-2 min-w-[150px] rounded-xl sidebar`}
        >
          <ul className="list-none flex flex-col items-center flex-1">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-normal py-1 px-4 cursor-pointer transition-colors hover:bg-white/10 rounded-md text-[16px]
        ${index === navLinks.length - 1 ? "mb-0" : "mb-4"} text-white`}
              >
                <Link href={`${nav.id}`}>{nav.title}</Link>
              </li>
            ))}
            <div className="items-center mt-8">
              <Link
               href="/login"  // <-- updated from mailto:abc@gmail.com
               className="button flex-shrink-0 transition-colors text-white py-3 px-6 font-medium text-[18px] font-poppins"
             >
                Login
              </Link>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
