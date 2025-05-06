import React from "react";

const ReedemBanner = () => {
  return (
    <section className="text-white py-20 px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Redeem Your Reward</h1>
      <p className="mb-6">Enter your redeem code to unlock exciting rewards!</p>
      <form className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Enter Redeem Code"
          className="w-full px-4 py-2 mb-4 text-black rounded"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded"
        >
          Redeem Now
        </button>
      </form>
    </section>
  );
};

export default ReedemBanner;
