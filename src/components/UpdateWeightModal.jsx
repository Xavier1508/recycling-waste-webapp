import React, { useState, useEffect } from 'react';
import { FaWeightHanging, FaSave, FaTimes } from 'react-icons/fa';
import { PulseLoader } from 'react-spinners';

const UpdateWeightModal = ({ isOpen, onClose, onSubmit, task, isSubmitting }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (task && task.items) {
      setItems(task.items.map(item => ({
        ...item,
        weight_kg: item.weight_kg || 0
      })));
    }
  }, [task]);

  const handleWeightChange = (itemId, newWeight) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.item_id === itemId ? { ...item, weight_kg: newWeight } : item
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ items });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaWeightHanging />
                Update Berat Sampah (Pickup #{task?.pickup_id})
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={item.item_id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                  <span className="font-semibold text-gray-700 flex-1">{item.category_name}</span>
                  <input
                    type="number"
                    value={item.weight_kg}
                    onChange={(e) => handleWeightChange(item.item_id, e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="p-2 border border-gray-300 rounded-md w-32 text-right focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  <span className="text-gray-500">kg</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada item sampah untuk diupdate.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
             <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
                Batal
             </button>
             <button type="submit" disabled={isSubmitting || items.length === 0} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 flex justify-center items-center min-w-[120px]">
                {isSubmitting ? <PulseLoader size={8} color="#fff"/> : <><FaSave className="mr-2"/> Simpan Berat</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateWeightModal;