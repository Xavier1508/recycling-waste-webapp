import React, { useState } from "react";
import Link from "next/link";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import {Organik, Anorganik, B3} from "@/assets";


const ArrangePickup = () => {
  const [selectedTrashTypes, setSelectedTrashTypes] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  const trashTypes = [
    { label: "ORGANIC", value: "organic", image: Organik },
    { label: "ANORGANIC", value: "anorganic", image: Anorganik },
    { label: "B3", value: "b3", image: B3 },
  ];

  const toggleTrashType = (type) => {
    setSelectedTrashTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = () => {
    const data = {
      address: "Rumah",
      trashTypes: selectedTrashTypes,
      time,
      date,
      photo,
    };
    console.log("Pickup arranged:", data);
  };

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
        <div className="max-w-md mx-auto p-4">
        <h2 className="text-2xl font-bold text-center mb-4">Arrange Pickup</h2>

        <div className="bg-white shadow-md p-4 rounded-xl mb-4">
            <div className="flex justify-between">
                <h3 className="font-semibold">Pickup Address</h3>
                <button className="text-green-500 text-sm font-medium"><Link href="/address">
                Change Address
                </Link></button>
            </div>
            <div className="mt-2">
            <p className="text-sm text-gray-700 leading-tight">Nosferatu (+004040040403440123)</p>
            <p className="text-sm text-gray-700 leading-tight">Jl. Raya Gubeng No. 123, 60210, Gubeng, Surabaya, Jawa Timur</p>
            </div>
        </div>

        <div className="mb-4">
            <h3 className="font-semibold mb-2">Trash Types <span className="text-sm text-gray-500">(Check the box)</span></h3>
            <div className="flex justify-between gap-2">
            {trashTypes.map((type) => (
                <div
                key={type.value}
                onClick={() => toggleTrashType(type.value)}
                className={`flex-1 border rounded-xl cursor-pointer p-2 text-center ${
                    selectedTrashTypes.includes(type.value) ? "border-green-500" : "border-gray-200"
                }`}
                >
                <img src={type.image} alt={type.label} className="h-24 mx-auto mb-2" />
                <p className="font-bold text-sm">{type.label}</p>
                </div>
            ))}
            </div>
        </div>

        <div className="mb-4">
            <h3 className="font-semibold mb-2">Photos</h3>
            <label className="block border-2 border-[#d93d41] rounded-lg p-4 text-center cursor-pointer">
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            {photo ? (
                <img src={photo} alt="Uploaded" className="h-24 mx-auto" />
            ) : (
                <>
                <div className="text-green-500 text-xl mb-1">📷</div>
                <p className="text-sm">Add New</p>
                </>
            )}
            </label>
        </div>

        <div className="mb-4">
            <h3 className="font-semibold mb-2">Pickup Arrangement</h3>
            <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full mb-2 px-4 py-2 border rounded-md"
            />
            <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            />
        </div>

        <button
            onClick={handleSubmit}
            className="bg-[#d93d41] text-white font-semibold py-3 w-full rounded-full hover:bg-green-600"
        >
            Done
        </button>
        </div>
    </div>
  );
};

export default ArrangePickup;