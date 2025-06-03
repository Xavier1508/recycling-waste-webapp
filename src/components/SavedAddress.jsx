import React from "react";
import Link from "next/link";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaMapPin } from "react-icons/fa";


const SavedAddress = () => {

    return (
    <div className="min-h-screen bg-gray-100 py-10">
        {/* Tombol Back */}
        <div className="max-w-md mx-auto mb-4">
            <button
            onClick={() => window.history.back()}
            className="text-[#7c1215] font-semibold flex items-center text-sm"
            >
            <FaArrowAltCircleLeft className="mr-3 text-3xl"/> <p className="text-base">Kembali</p>
            </button>
        </div>
        <div className="bg-[#ffffff] p-6 rounded-lg shadow-md w-full max-w-md mx-auto text-black">
        <h2 className="text-lg font-bold mb-6"> Alamat Pengambilan </h2>

        {/* Provinsi */}
        <div className="mb-4">
            <label className="block font-semibold">Provinsi</label>
            <input
            type="text"
            placeholder="Jawa Timur"
            className="border-b border-gray-400 w-full py-2 outline-none"
            />
        </div>

        {/* Kota / Kabupaten */}
        <div className="mb-4">
            <label className="block font-semibold">Kota / Kabupaten</label>
            <input
            type="text"
            placeholder="Surabaya"
            className="border-b border-gray-400 w-full py-2 outline-none"
            />
        </div>

        {/* Kecamatan */}
        <div className="mb-4">
            <label className="block font-semibold">Kecamatan</label>
            <input
            type="text"
            placeholder="Gubeng"
            className="border-b border-gray-400 w-full py-2 outline-none"
            />
        </div>

        {/* Kode Pos */}
        <div className="mb-4">
            <label className="block font-semibold">Kode Pos</label>
            <input
            type="text"
            placeholder="60210"
            className="border-b border-gray-400 w-full py-2 outline-none"
            />
        </div>

        {/* Detail Lain */}
        <div className="mb-4">
            <label className="block font-semibold">Nama Jalan</label>
            <input
            type="text"
            placeholder="Jl. Raya Gubeng No. 123"
            className="border-b border-gray-400 w-full py-2 outline-none"
            />
        </div>

        {/* Pinpoint */}
        <div className="mb-4">
            <button className="w-full border border-gray-300 rounded-md py-3 px-4 flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2"><FaMapPin className="text-[#CB0404]" /> Atur Berdasarkan Pinpoint</span>
            <span>›</span>
            </button>
        </div>

        {/* Checkbox */}
        {/* <div className="flex items-center mb-4">
            <input id="utama" type="checkbox" className="mr-2" />
            <label htmlFor="utama" className="text-sm font-medium">
            Atur Sebagai Alamat Utama
            </label>
        </div> */}

        {/* Simpan Button */}
        <button className="w-full bg-[#7c1215] text-white py-3 rounded-full font-semibold">
            Simpan Data
        </button>
        </div>
    </div>    
    
  );
};

export default SavedAddress;