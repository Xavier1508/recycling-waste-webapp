import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IoWarningOutline, IoClose } from 'react-icons/io5';

const AuthPromptModal = ({ isOpen, onClose, title = "Akses Terbatas", message = "Anda harus login atau mendaftar terlebih dahulu untuk menggunakan fitur ini." }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleRegister = () => {
    onClose();
    router.push('/signup');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <IoWarningOutline className="text-3xl text-yellow-500 mr-3" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <IoClose className="text-2xl" />
          </button>
        </div>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleLogin}
            className="w-full bg-[#d93d41] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#b92d31] transition-colors focus:outline-none focus:ring-2 focus:ring-[#d93d41] focus:ring-opacity-50"
          >
            Login Sekarang
          </button>
          <button
            onClick={handleRegister}
            className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Daftar Akun Baru
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
