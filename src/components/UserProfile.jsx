import React from "react";

const UserProfile = () => {
  // Simulasi data kosong
  const user = {
    name: "Nosferatu",
    activePoints: 900,
    incomingPoints: 1000,
    outgoingPoints: 100,
    articles: [], // Kosong (tidak ada data artikel)
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 to-green-500 p-6 flex justify-between items-center text-white rounded-b-xl">
        <div>
          <p className="text-sm">Selamat Datang</p>
          <h1 className="text-2xl font-bold">{user.name}</h1>
        </div>
        <div className="flex gap-4">
          <button className="bg-white text-green-600 px-4 py-2 rounded-full hover:bg-green-100 transition">Saved Address</button>
          <button className="bg-white text-green-600 px-4 py-2 rounded-full hover:bg-green-100 transition">Edit Profile</button>
          <button className="bg-white text-green-600 px-4 py-2 rounded-full hover:bg-green-100 transition">Log Out</button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Card */}
        <div className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold">Loyalty Points</h2>
            <p className="mt-4 text-sm">Active Points</p>
            <p className="text-3xl font-bold">{user.activePoints} Points</p>
            <button className="mt-4 bg-white text-green-600 px-4 py-2 rounded-full hover:bg-green-100 transition">
              Exchange Points
            </button>
          </div>
          <div className="mt-6 flex justify-between text-sm">
            <div className="flex flex-col items-center">
              <span>⬇</span>
              <p>Total Incoming Points</p>
              <p className="font-bold">{user.incomingPoints} Points</p>
            </div>
            <div className="flex flex-col items-center">
              <span>➡</span>
              <p>Total Outgoing Points</p>
              <p className="font-bold">{user.outgoingPoints} Points</p>
            </div>
          </div>
        </div>

        {/* Menu and Articles */}
        <div className="space-y-6">
          {/* Menu Shortcuts */}
          <div className="bg-white rounded-xl p-6 shadow-md grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-100 text-green-600 rounded-lg py-4">Katalog Sampah</div>
            <div className="bg-green-100 text-green-600 rounded-lg py-4">Drop Point</div>
            <div className="bg-green-100 text-green-600 rounded-lg py-4">Pick Up</div>
          </div>

          {/* Articles */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Artikel Terbaru</h3>
            {user.articles.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada artikel tersedia.</p>
            ) : (
              user.articles.map((article, idx) => (
                <div key={idx} className="flex gap-4 mb-4">
                  <img src={article.image} alt="thumbnail" className="w-32 h-20 rounded object-cover" />
                  <div>
                    <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">Blog & Artikel</span>
                    <h4 className="text-md font-semibold">{article.title}</h4>
                    <p className="text-sm text-gray-500">{article.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
