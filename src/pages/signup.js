import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import SignUp from "@/components/SignUp";

const signup = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
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
            color="#fff"
            loading={loading}
            size={15}
            css={override}
          />
        </div>
      ) : (
        <>
          <SignUp />  |
        </>
      )}
    </div>
  );
};

export default signup;
