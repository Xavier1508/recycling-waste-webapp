import React from 'react';
import { IoWarningOutline, IoCopyOutline } from "react-icons/io5";

const DriverCodeModal = ({ isOpen, onClose, driverCode }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(driverCode)
      .then(() => alert("Kode Driver berhasil disalin!"))
      .catch(err => console.error('Gagal menyalin:', err));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Pendaftaran Berhasil!</h2>
        <p className="text-gray-600 mb-5">
          Akun Anda telah dibuat. Silakan simpan dan gunakan Kode Driver unik di bawah ini untuk login.
        </p>

        <div className="relative bg-gray-100 p-4 rounded-lg mb-4">
          <p className="text-2xl font-mono font-bold text-gray-800 tracking-widest">
            {driverCode}
          </p>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            title="Salin Kode"
          >
            <IoCopyOutline size={20} />
          </button>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md text-left mb-6">
          <div className="flex">
            <div className="py-1"><IoWarningOutline className="mr-3 h-6 w-6" /></div>
            <div>
              <p className="font-bold">Penting!</p>
              <p className="text-sm">Kode ini hanya ditampilkan **satu kali**. Mohon dicatat atau disimpan di tempat yang aman. Anda akan membutuhkannya setiap kali login.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#d93d41] text-white py-3 px-4 rounded-full font-semibold hover:bg-[#b92d31]"
        >
          Saya Sudah Menyimpan Kode Ini
        </button>
      </div>
    </div>
  );
};

export default DriverCodeModal;
