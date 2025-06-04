import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import SignUp from "@/components/SignUp"; // Menggunakan komponen SignUp.jsx

const SignupPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const override = `
    display: block;
    margin: 0 auto;
  `;

  return (
    <div>
      {loading ? (
        <div className="sweet-loading bg-white flex justify-center items-center h-screen">
          <PulseLoader
            color="#D93D41"
            loading={loading}
            size={15}
            cssOverride={{ display: "block", margin: "0 auto" }}
          />
        </div>
      ) : (
        <SignUp /> // Komponen SignUp akan menangani UI dan logika form
      )}
    </div>
  );
};

export default SignupPage;
