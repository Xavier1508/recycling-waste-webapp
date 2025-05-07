import React from "react";

const UserProfile = () => {
  // Simulate no user data
  const userData = null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center justify-center p-6">
          {userData ? (
            <>
              <img
                src={userData.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-500 mb-4"
              />
              <div className="text-center">
                <h2 className="text-xl font-semibold">{userData.name}</h2>
                <p className="text-gray-600">{userData.email}</p>
                <p className="text-gray-600">{userData.phone}</p>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>No user data available.</p>
            </div>
          )}
        </div>

        {/* Points Info */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 text-center">
          {userData ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Your Points</h3>
              <p className="text-green-600 text-3xl font-bold">
                {userData.points} pts
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Keep recycling to earn more points!
              </p>
            </>
          ) : null}
        </div>

        {/* Address Info */}
        <div className="border-t border-gray-200 p-6 text-center">
          {userData ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p className="text-gray-700">{userData.address}</p>
            </>
          ) : null}
        </div>

        {userData && (
          <div className="border-t border-gray-200 p-6 text-center">
            <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
