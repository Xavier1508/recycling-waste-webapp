import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { groceryReward, cashReward, treeReward, voucherReward} from '../assets';

const rewardOptions = [
  {
    id: 'cash',
    title: 'Cash Rewards',
    points: 500,
    description: 'Exchange your points for cash that will be transferred to your account.',
    image: cashReward, // You'll need to add these images to your assets
  },
  {
    id: 'groceries',
    title: 'Grocery Package',
    points: 750,
    description: 'Redeem points for a package of essential groceries.',
    image: groceryReward,
  },
  {
    id: 'vouchers',
    title: 'Shopping Vouchers',
    points: 300,
    description: 'Get vouchers for popular retail stores and online shops.',
    image: voucherReward,
  },
  {
    id: 'plants',
    title: 'Plant a Tree',
    points: 200,
    description: 'Contribute to environmental conservation by planting trees.',
    image: treeReward,
  }
];

const RedeemSection = () => {
  const [userPoints, setUserPoints] = useState(1000); // For demo purposes
  const [selectedReward, setSelectedReward] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleSelectReward = (reward) => {
    setSelectedReward(reward);
  };
  
  const handleRedeemPoints = () => {
    if (!selectedReward) return;
    
    if (userPoints >= selectedReward.points) {
      setUserPoints(userPoints - selectedReward.points);
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedReward(null);
      }, 3000);
    }
  };
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-4xl font-bold text-center mb-4">Redeem Your Recycling Points</h2>
          <p className="text-gray-600 text-center max-w-2xl mb-6">
            Thank you for your commitment to recycling! Exchange your earned points for various rewards.
          </p>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-xl font-bold">Your Current Points: <span className="text-green-600">{userPoints}</span></p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewardOptions.map((reward) => (
            <motion.div
              key={reward.id}
              whileHover={{ scale: 1.03 }}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border-2 ${
                selectedReward?.id === reward.id ? 'border-green-500' : 'border-transparent'
              }`}
              onClick={() => handleSelectReward(reward)}
            >
              <div className="h-48 bg-gray-200">
                {/* Replace with actual image when available */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {reward.image ? (
                    <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                  ) : (
                    <span>{reward.title} Image</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{reward.title}</h3>
                <p className="text-gray-600 mb-4">{reward.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold">{reward.points} Points</span>
                  <button
                    className={`px-4 py-2 rounded ${
                      userPoints >= reward.points 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={userPoints < reward.points}
                  >
                    Select
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {selectedReward && (
          <div className="mt-10 flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-4">Selected Reward: {selectedReward.title}</h3>
            <p className="mb-6">You will redeem {selectedReward.points} points for this reward.</p>
            <button 
              onClick={handleRedeemPoints}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
            >
              Confirm Redemption
            </button>
          </div>
        )}
        
        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg max-w-md text-center">
              <h3 className="text-2xl font-bold text-green-600 mb-4">Redemption Successful!</h3>
              <p className="mb-4">You have successfully redeemed {selectedReward.title}.</p>
              <p className="mb-6">Your new balance: {userPoints} points</p>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RedeemSection;