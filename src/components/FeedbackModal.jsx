import React, { useState } from 'react';
import { FaStar, FaRegStar, FaPaperPlane } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const FeedbackModal = ({ pickupId, tpaName, pointsEarned, onSubmit, onClose, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Mohon berikan rating bintang.");
      return;
    }
    onSubmit({ rating, comment, tip });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all text-center">
        <h2 className="text-2xl font-bold text-green-600">Penjemputan Selesai!</h2>
        <p className="text-gray-600 mt-2">Sampah Anda telah diantar ke <span className="font-semibold">{tpaName || "Fasilitas"}</span>.</p>
        <p className="text-lg mt-1 mb-4">Anda mendapatkan <span className="font-bold text-yellow-500">{pointsEarned || 0} Poin!</span></p>
        <div className="border-t my-4"></div>
        <form onSubmit={handleSubmit}>
          <h3 className="font-semibold text-gray-800 mb-3">Beri ulasan untuk pengalaman Anda</h3>
          <div className="flex justify-center text-4xl text-yellow-400 mb-4 cursor-pointer">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                {rating >= star ? <FaStar /> : <FaRegStar />}
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tulis kritik & saran Anda di sini... (Opsional)" className="w-full p-2 border border-gray-300 rounded-md min-h-[80px]"/>
          <input type="number" value={tip} onChange={(e) => setTip(e.target.value)} placeholder="Beri Tip untuk Driver (Opsional, contoh: 5000)" className="w-full p-2 mt-2 border border-gray-300 rounded-md"/>
          <div className="flex gap-3 mt-4">
             <button type="button" onClick={onClose} className="w-1/2 bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-300">Nanti Saja</button>
             <button type="submit" disabled={isSubmitting} className="w-1/2 bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex justify-center items-center">
                {isSubmitting ? <PulseLoader size={8} color="#fff"/> : <><FaPaperPlane className="mr-2"/> Kirim Ulasan</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default FeedbackModal;