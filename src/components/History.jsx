import React from "react";
import Link from "next/link";
import { IoCaretBackCircle } from "react-icons/io5";
import Image from "next/image";
import { ambilsampah } from '../assets';

const kuda = [
    {
        id: 1,
        date: "2023-11-10",
        address: "Jl. Pahlawan No. 3, Surabaya",
        points: 200,
        status: "Selesai"
    },
    {
        id: 2,
        date: "2023-10-05",
        address: "Jl. Raya No. 1, Surabaya",
        points: 150,
        status: "Selesai"
    },
    {
        id: 3,
        date: "2023-09-01",
        address: "Jl. Raya No. 1, Surabaya",
        points: 100,
        status: "Selesai"
    }
]

const History = () => {
    return(
        <div className="min-h-screen bg-gray-100 py-10 ">
            <div className="text-left text-2xl mt-6 ml-10 flex flex-row gap-2 w-fit items-start">
                <Link href={"/userprofile"}>
                <button className="bg-[#7c1215] text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#bf575a] transition duration-300">
                    <IoCaretBackCircle className="text-3xl" /> <p>Kembali</p>
                </button>
                </Link>
            </div>
            <div className="">
                <div className="bg-[#e2bbbb] rounded-lg shadow-md max-w-5xl p-5 mx-auto">
                    <h2 className="text-center text-2xl font-bold text-black">
                        Riwayat Pengambilan
                    </h2>
                </div>
                {kuda.map((kuda) => (
                <div key={kuda.id} className="bg-white rounded-lg shadow-md max-w-5xl p-5 mx-auto mt-6 flex items-center gap-4 relative">
                    <Image img src={ambilsampah} alt="Kuda" width={100} height={100} className="w-auto h-autop object-cover" />
                    <div className="">
                    <h3 className="text-lg font-semibold mb-2"> Pengambilan {kuda.date}</h3>
                    <p className="text-sm text-gray-600"> Alamat: {kuda.address}</p>
                    <p className="text-sm text-gray-600"> Status: {kuda.status}</p>
                    </div>
                    <div className="absolute text-green-600 text-l font-bold top-4 right-4">
                    <p> Poin: +{kuda.points}</p>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
};

export default History;