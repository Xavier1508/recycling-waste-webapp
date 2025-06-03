import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import ArrangePickup from "@/components/ArrangePickup";   
import Navbar from "@/components/Navbar";
import styles from "@/style";                          

const pickup = () => {
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
        /* Spinner saat loading */
        <div className="sweet-loading bgRedGradient flex justify-center items-center h-screen">
          <PulseLoader color="#ffff"
             loading={loading}
             size={15}
             css={override}
             aria-label="Loading Spinner"
             data-testid="loader"/>
        </div>
      ) : (
        <>
            <ArrangePickup />
        </>
      )}
    </div>
  );
};

export default pickup;