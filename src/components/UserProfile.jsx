import React from "react";
import Link from "next/link"; 
import { FaBook } from "react-icons/fa";
import { MdPinDrop } from "react-icons/md";
import { FaTruckMoving } from "react-icons/fa6";
import { FaCircleArrowDown } from "react-icons/fa6";
import { FaCircleArrowUp } from "react-icons/fa6";
import { MdCurrencyExchange } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { TbPigMoney } from "react-icons/tb";


const UserProfile = () => {
  // Simulasi data kosong
  const user = {
    name: "Nosferatu",
    activePoints: 1000,
    incomingPoints: 1300,
    outgoingPoints: 300,
    articles: [], 
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#bf575a] to-[#7c1215] p-6 flex flew-wrap gap-2 sm:gap-4 justify-end justify-between items-center text-white rounded-b-xl">
        <div>
          <p className="text-sm ml-2">Selamat Datang</p>
          <h1 className="text-2xl font-bold ml-3">{user.name}</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/address">
            <button className="bg-white text-[#d93d41] px-4 py-2 rounded-full hover:bg-green-100 transition flex items-center gap-2"><FaBookmark className="text-xl hidden xs:inline"/> Address</button>
          </Link>
          <button className="bg-white text-[#d93d41] px-4 py-2 rounded-full hover:bg-green-100 transition flex items-center gap-2"><CgProfile className="text-2xl hidden xs:inline"/>Edit</button>
          {/* <button className="bg-white text-[#d93d41] px-4 py-2 rounded-full hover:bg-green-100 transition">Log Out</button> */}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Card */}
        <div className="bg-gradient-to-r from-[#d93d41] to-[#7c1215] text-white rounded-xl p-6 shadow-lg flex flex-col justify-between relative">
          <div className="flex flex-col items-start">
            <h2 className="text-xl font-semibold flex items-center gap-2"><TbPigMoney className="text-4xl text-[#00FF9C]"/>Loyalty Points</h2>
            <p className="mt-4 text-sm">Active Points</p>
            <p className="text-3xl font-bold">{user.activePoints} Points</p>
          </div>
            <button className="absolute top-7 right-8 mt-4 bg-white text-[#d93d41] px-4 py-2 rounded-full hover:bg-green-100 transition w-fit">
              <Link href="/redeem" className="flex item-center gap-2">
              <MdCurrencyExchange className="text-2xl "/> 
              <p className="hidden xs:inline">Redeem Points</p>
              </Link>
            </button>
          <div className="mt-6 flex justify-between text-sm">
            <div className="flex flex-col items-center">
              <span><FaCircleArrowDown className="text-2xl" /></span>
              <p>Total Incoming Points</p>
              <p className="font-bold">{user.incomingPoints} Points</p>
            </div>
            <div className="flex flex-col items-center">
              <span><FaCircleArrowUp className="text-2xl" /></span>
              <p>Total Outgoing Points</p>
              <p className="font-bold">{user.outgoingPoints} Points</p>
            </div>
          </div>
        </div>

        {/* Menu and Articles */}
        <div className="space-y-6">
          {/* Menu Shortcuts */}
          <div className="p-4 grid grid-cols-3 gap-4 text-center max-w-xl mx-auto">
            <div className="flex flex-col items-center justify-center bg-[#bf575a] w-20 sm:w-24 h-20 sm:h-24 rounded-lg py-2 mx-auto">
              <div className="text-white">
                <FaBook className="text-3xl sm:text-4xl" />
              </div>
              <span className="text-xs sm:text-sm mt-1 text-white">Katalog</span>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#bf575a] w-20 sm:w-24 h-20 sm:h-24 rounded-lg py-2 mx-auto">
              <div className="text-white">
                <MdPinDrop className="text-3xl sm:text-4xl" />
              </div>
              <span className="text-xs sm:text-sm mt-1 text-white">Drop Point</span>
            </div>

            <div className="flex flex-col items-center justify-center bg-[#bf575a] w-20 sm:w-24 h-20 sm:h-24 rounded-lg py-2 mx-auto">
              <div className="text-white">
                <FaTruckMoving className="text-3xl sm:text-4xl" />
              </div>
              <span className="text-xs sm:text-sm mt-1 text-white">Pick Up</span>
            </div>
          </div>


          {/* Articles */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Artikel Terbaru</h3>
            {user.articles.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada artikel tersedia.</p>
            ) : (
              user.articles.map((article, idx) => (
                <div key={idx} className="flex gap-4 mb-4">
                  <img src={article.image} alt="thumbnail" className="w-32 h-20 rounded object-cover" />
                  <div>
                    <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">Blog & Artikel</span>
                    <h4 className="text-md font-semibold">{article.title}</h4>
                    <p className="text-sm text-gray-500">{article.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
