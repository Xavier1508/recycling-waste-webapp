import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import SignUpDriver from "@/components/SignUpDriver";

const SignupDriverPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
        <SignUpDriver />
      )}
    </div>
  );
};

export default SignupDriverPage;
