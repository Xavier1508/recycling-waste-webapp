import React, { useState, useRef } from "react";
import { Pencil } from "lucide-react";
import reviewPerson5 from "../assets/images/reviewPerson5.png";

const ProfilePage = () => {
  const [profilePicture, setProfilePicture] = useState(reviewPerson5);
  const [userData, setUserData] = useState({
    firstName: "Justin",
    lastName: "Prince",
    email: "randomemail@gmail.com",
    phone: "+91 1234567890",
    country: "USA",
    state: "Jawa Timuer",
    city: "Malang",
    postalCode: "123456",
  });

  const [editData, setEditData] = useState({});
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePicture(imageUrl);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const startEdit = (section) => {
    setEditData(userData);
    if (section === "personal") setIsEditingPersonal(true);
    if (section === "address") setIsEditingAddress(true);
  };

  const cancelEdit = (section) => {
    setEditData({});
    if (section === "personal") setIsEditingPersonal(false);
    if (section === "address") setIsEditingAddress(false);
  };

  const saveEdit = (section) => {
    setUserData(editData);
    setEditData({});
    if (section === "personal") setIsEditingPersonal(false);
    if (section === "address") setIsEditingAddress(false);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Picture */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src={profilePicture}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="space-x-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleButtonClick}
            >
              Change Picture
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          {!isEditingPersonal && (
            <Pencil
              className="w-4 h-4 cursor-pointer"
              onClick={() => startEdit("personal")}
            />
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {["firstName", "lastName", "email", "phone"].map((field) => (
            <div key={field}>
              <p className="text-sm text-gray-500">
                {field.replace(/([A-Z])/g, " $1")}
              </p>
              {isEditingPersonal ? (
                <input
                  type="text"
                  name={field}
                  value={editData[field] || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-2 py-1"
                />
              ) : (
                <p className="font-medium">{userData[field]}</p>
              )}
            </div>
          ))}
        </div>
        {isEditingPersonal && (
          <div className="flex gap-2 mt-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              onClick={() => saveEdit("personal")}
            >
              Save
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              onClick={() => cancelEdit("personal")}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Address</h2>
          {!isEditingAddress && (
            <Pencil
              className="w-4 h-4 cursor-pointer"
              onClick={() => startEdit("address")}
            />
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {["country", "state", "city", "postalCode"].map((field) => (
            <div key={field}>
              <p className="text-sm text-gray-500">
                {field.replace(/([A-Z])/g, " $1")}
              </p>
              {isEditingAddress ? (
                <input
                  type="text"
                  name={field}
                  value={editData[field] || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-2 py-1"
                />
              ) : (
                <p className="font-medium">{userData[field]}</p>
              )}
            </div>
          ))}
        </div>
        {isEditingAddress && (
          <div className="flex gap-2 mt-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              onClick={() => saveEdit("address")}
            >
              Save
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              onClick={() => cancelEdit("address")}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
