import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { userAPI, catalogAPI, redeemAPI } from '@/services/api';
import AuthPromptModal from '@/components/AuthPromptModal';
import { useRouter } from 'next/router';
import { FaGift, FaCoins, FaSadTear } from 'react-icons/fa';

// Impor gambar dari src/assets/index.js menggunakan alias @
import { 
    groceryReward, 
    cashReward, 
    treeReward, 
    voucherReward, 
    defaultRewardPlaceholder // Pastikan ini diekspor dari src/assets/index.js
} from '@/assets';

const RedeemSection = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState({ title: "", message: "", newBalance: "" });

  const router = useRouter();

  // Pemetaan tipe item ke gambar lokal (jika diperlukan jika API tidak menyediakan URL gambar)
  // Namun, karena Anda sudah hardcode dengan gambar yang diimpor, kita bisa langsung pakai.
  const localImageMap = {
    cash: cashReward,
    grocery: groceryReward,
    tree_planting: treeReward,
    voucher: voucherReward,
  };

  useEffect(() => {
    const checkLoginAndFetchData = async () => {
      setIsLoading(true);
      setIsLoadingPoints(true);
      const token = localStorage.getItem('authToken');

      if (token) {
        setIsLoggedIn(true);
        try {
          const pointsRes = await userAPI.getPoints();
          setUserPoints(pointsRes.data.current_points || 0);
        } catch (error) {
          console.error("Gagal mengambil poin pengguna:", error);
          setUserPoints(0);
        } finally {
            setIsLoadingPoints(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserPoints(0);
        setIsLoadingPoints(false);
      }

      try {
        // Menggunakan data katalog hardcoded dengan gambar yang sudah diimpor
        const hardcodedCatalog = [
          { catalog_id: 'cash', item_name: 'Cash Rewards', points_required: 500, description: 'Tukarkan poin Anda dengan uang tunai...', image_src: cashReward, item_type: 'cash' },
          { catalog_id: 'groceries', item_name: 'Grocery Package', points_required: 750, description: 'Tukarkan poin dengan paket sembako...', image_src: groceryReward, item_type: 'grocery' },
          { catalog_id: 'vouchers', item_name: 'Shopping Vouchers', points_required: 300, description: 'Dapatkan voucher untuk toko ritel...', image_src: voucherReward, item_type: 'voucher' },
          { catalog_id: 'plants', item_name: 'Plant a Tree', points_required: 200, description: 'Berkontribusi pada konservasi...', image_src: treeReward, item_type: 'tree_planting' }
        ];
        // Jika API catalogItems mengembalikan item.image_url yang merupakan nama file di aset Anda,
        // Anda perlu logika untuk mencocokkan nama file tersebut dengan variabel yang diimpor.
        // Untuk saat ini, kita langsung gunakan variabel impor di `image_src`.
        setCatalogItems(hardcodedCatalog);

        // Jika Anda fetch dari API:
        // const catalogRes = await catalogAPI.getCatalogItems();
        // const itemsWithImages = (catalogRes.data || []).map(item => ({
        //   ...item,
        //   image_src: localImageMap[item.item_type?.toLowerCase()] || item.image_url || defaultRewardPlaceholder
        // }));
        // setCatalogItems(itemsWithImages);

      } catch (error) {
        console.error("Gagal mengambil item katalog:", error);
        setCatalogItems([]);
      }
      setIsLoading(false);
    };

    checkLoginAndFetchData();
  }, []);

  const handleSelectReward = (reward) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (userPoints >= reward.points_required) {
      setSelectedReward(reward);
    } else {
      alert("Poin Anda tidak cukup untuk menukarkan hadiah ini.");
    }
  };

  const handleRedeemPoints = async () => {
    if (!selectedReward || !isLoggedIn) return;

    if (userPoints >= selectedReward.points_required) {
      setIsRedeeming(true);
      try {
        // await redeemAPI.redeemPoints({ /* ... */ }); // Panggil API redeem Anda
        
        // Simulasi berhasil
        const newPointBalance = userPoints - selectedReward.points_required;
        setConfirmationMessage({
            title: "Penukaran Berhasil!",
            message: `Anda telah berhasil menukarkan ${selectedReward.item_name}.`,
            newBalance: `Saldo poin baru Anda: ${newPointBalance} poin`
        });
        setShowConfirmation(true);
        setSelectedReward(null);
        
        if(isLoggedIn){
            setIsLoadingPoints(true);
            const pointsRes = await userAPI.getPoints();
            setUserPoints(pointsRes.data.current_points || 0);
            setIsLoadingPoints(false);
        }
      } catch (error) {
        console.error("Gagal melakukan penukaran:", error);
        alert(error.response?.data?.error || "Terjadi kesalahan saat penukaran.");
      } finally {
        setIsRedeeming(false);
      }
    }
  };

  const PointsDisplay = () => (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-xl shadow-xl w-full max-w-md text-center">
      <div className="flex items-center justify-center mb-2">
        <FaCoins className="text-yellow-300 text-3xl mr-3" />
        <p className="text-xl font-semibold">Poin Anda Saat Ini</p>
      </div>
      {isLoadingPoints ? (
        <p className="text-4xl font-bold animate-pulse">---</p>
      ) : (
        <p className="text-4xl font-bold">{userPoints}</p>
      )}
      {!isLoggedIn && !isLoadingPoints && (
        <p className="text-xs mt-1 opacity-80">(Login untuk melihat poin riil)</p>
      )}
    </div>
  );

  if (isLoading && isLoadingPoints) {
    return <div className="text-center py-20 text-gray-600">Memuat data hadiah dan poin...</div>;
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-3">Tukarkan Poin Berharga Anda</h2>
          <p className="text-gray-600 text-center max-w-2xl mb-8 text-sm sm:text-base">
            Setiap tindakan daur ulang Anda sangat berarti. Kini saatnya menikmati hasilnya!
          </p>
          <PointsDisplay />
        </div>

        {catalogItems.length === 0 && !isLoading && (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <FaSadTear className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Oops! Belum ada hadiah yang bisa ditukar saat ini.</p>
                <p className="text-gray-400 text-sm">Silakan cek kembali nanti ya!</p>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {catalogItems.map((reward) => (
            <motion.div
              key={reward.catalog_id}
              whileHover={{ y: -6, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)" }}
              className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between border-2 transition-all duration-300 ${
                selectedReward?.catalog_id === reward.catalog_id ? 'border-green-500 ring-2 ring-green-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="h-52 w-full bg-gray-200 relative">
                <Image
                  src={reward.image_src || defaultRewardPlaceholder} // Menggunakan image_src
                  alt={reward.item_name}
                  layout="fill"
                  objectFit="cover"
                />
                 <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    {reward.points_required} Poin
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{reward.item_name}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-grow">{reward.description}</p>
                <div className="mt-auto">
                  <button
                    onClick={() => handleSelectReward(reward)}
                    className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                      isLoggedIn && userPoints >= reward.points_required
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isLoggedIn || userPoints < reward.points_required}
                  >
                    <FaGift />
                    {selectedReward?.catalog_id === reward.catalog_id ? 'Terpilih' : 'Pilih Hadiah'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedReward && isLoggedIn && (
          <div className="mt-12 flex flex-col items-center bg-white p-6 rounded-xl shadow-xl max-w-lg mx-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Konfirmasi Penukaran: {selectedReward.item_name}</h3>
            <div className="w-24 h-24 relative mb-4 rounded-md overflow-hidden">
                <Image src={selectedReward.image_src || defaultRewardPlaceholder} alt={selectedReward.item_name} layout="fill" objectFit="cover"/>
            </div>
            <p className="mb-2 text-gray-600 text-center">Anda akan menukarkan <span className="font-bold text-green-600">{selectedReward.points_required} poin</span> untuk hadiah ini.</p>
            <p className="mb-5 text-gray-600 text-center">Sisa poin Anda setelah penukaran: <span className="font-bold">{userPoints - selectedReward.points_required} poin</span>.</p>
            <div className="flex gap-3 w-full">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="w-full px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRedeemPoints}
                  disabled={isRedeeming}
                  className="w-full px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-70"
                >
                  {isRedeeming ? "Memproses..." : "Ya, Tukarkan Sekarang"}
                </button>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md text-center w-full">
              <div className="text-green-500 text-5xl mb-4 mx-auto w-fit">✓</div>
              <h3 className="text-2xl font-bold text-green-600 mb-3">{confirmationMessage.title}</h3>
              <p className="mb-3 text-gray-700">{confirmationMessage.message}</p>
              <p className="mb-5 text-gray-600 font-medium">{confirmationMessage.newBalance}</p>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                Luar Biasa!
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RedeemSection;
