import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { close, logo, menu } from "@/assets";
import ProfileIconSVG from "@/assets/images/profileIcon.svg";
import { navLinks as defaultNavLinks } from "@/constants";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [navLinks, setNavLinks] = useState(defaultNavLinks);
  const router = useRouter();

  // PENINGKATAN: Menggunakan useCallback agar fungsi ini tidak dibuat ulang pada setiap render,
  // ini lebih optimal untuk performa.
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("userData");

    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserProfileData(userData);
        setIsLoggedIn(true);

        // --- PERUBAHAN UTAMA SESUAI PERMINTAAN ANDA ---
        if (userData.role === 'driver') {
          // Jika rolenya driver, KOSONGKAN semua nav link umum.
          setNavLinks([]); 
        } else {
          // Jika customer atau tamu, tampilkan link seperti biasa.
          setNavLinks(defaultNavLinks);
        }
        // ---------------------------------------------

      } catch (error) {
        console.error("Gagal parse data pengguna dari localStorage:", error);
        localStorage.clear();
        setIsLoggedIn(false);
        setUserProfileData(null);
        setNavLinks(defaultNavLinks);
      }
    } else {
      setIsLoggedIn(false);
      setUserProfileData(null);
      setNavLinks(defaultNavLinks);
    }
  }, []); // useCallback tidak memiliki dependency di sini

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    checkAuthStatus(); // Panggil fungsi saat komponen pertama kali dimuat
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("authChange", checkAuthStatus); // Dengar event login/logout

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("authChange", checkAuthStatus);
    };
  }, [checkAuthStatus]); // PERBAIKAN: Gunakan fungsi yang stabil sebagai dependency

  const getProfileLink = () => {
    if (!userProfileData) return "/login";
    return userProfileData.role === 'driver' ? '/driverprofile' : '/userprofile';
  };

  const generateHref = (id) => id.startsWith('/') ? id : `/${id}`;

  return (
    // SEMUA KODE JSX, STYLE, DAN LOGIKA TAMPILAN ANDA DI BAWAH INI TETAP SAMA SEPERTI ASLINYA
    <nav
      className={`w-full overflow-x-visible md:px-28 px-4 flex md:py-4 py-3 justify-center items-center absolute top-0 left-0 z-10 ${
        isSticky ? "sticky-navbar" : ""
      }`}
    >
      <Link href="/">
        <Image
          src={logo}
          alt="Logo ZMGT"
          className="w-[100px] h-[90px] cursor-pointer mr-20"
        />
      </Link>

      {/* Tampilkan nav-desktop hanya jika ada link yang harus ditampilkan */}
      {navLinks.length > 0 ? (
        <ul className="list-none md:flex hidden justify-center items-center text-[18px] flex-1 nav-desktop">
          {navLinks.map((nav, index) => (
            <li key={nav.id} className={`font-poppins`}>
              <Link
                href={generateHref(nav.id)}
                className={`font-poppins font-normal hover:text-dimWhite transition-colors cursor-pointer text-[16px] ${
                  index === navLinks.length - 1 ? "mr-0" : "mr-10"
                } text-white`}
              >
                {nav.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        // Beri spacer kosong agar tombol profil tetap di kanan jika tidak ada nav links
        <div className="flex-1"></div>
      )}

      {/* Desktop Authentication Section */}
      <div className="md:flex hidden items-center">
        {isLoggedIn && userProfileData ? (
          <div
            className="button flex-shrink-0 transition-colors text-white py-3 px-4 font-medium text-[18px] font-poppins flex items-center space-x-3 rounded-full"
          >
            <span>Hello, {userProfileData.first_name}!</span>
            <Link href={getProfileLink()} passHref>
              <div className="cursor-pointer rounded-full p-1 hover:bg-white/20 transition-colors">
                <Image
                  src={ProfileIconSVG}
                  alt="Profil Pengguna"
                  width={35}
                  height={35}
                />
              </div>
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="button flex-shrink-0 transition-colors text-white py-3 px-6 font-medium text-[18px] font-poppins"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
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
            {navLinks.length > 0 && navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-normal py-1 px-4 cursor-pointer transition-colors hover:bg-white/10 rounded-md text-[16px] ${
                  index === navLinks.length - 1 ? "mb-0" : "mb-4"
                } text-white`}
                onClick={() => setToggle(false)}
              >
                <Link href={generateHref(nav.id)}>{nav.title}</Link>
              </li>
            ))}

            <div className="items-center mt-8 w-full">
              {isLoggedIn && userProfileData ? (
                <>
                  <li className="font-poppins font-normal py-2 px-4 text-white w-full text-center mb-2 cursor-default">
                    Hallo, {userProfileData.first_name}!
                  </li>
                  <li
                    className="font-poppins font-normal py-2 px-4 cursor-pointer transition-colors hover:bg-white/10 rounded-md text-[16px] mb-4 text-white w-full text-center flex items-center justify-center space-x-2"
                    onClick={() => {
                      router.push(getProfileLink());
                      setToggle(false);
                    }}
                  >
                     <Image
                        src={ProfileIconSVG}
                        alt="Profil"
                        width={20}
                        height={20}
                      />
                    <span>Profil Saya</span>
                  </li>
                </>
              ) : (
                <Link
                  href="/login"
                  className="button flex-shrink-0 transition-colors text-white py-3 px-6 font-medium text-[18px] font-poppins w-full text-center block"
                  onClick={() => setToggle(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;