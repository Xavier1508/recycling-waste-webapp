import React, { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import SavedAddress from "@/components/SavedAddress";
import Navbar from "@/components/Navbar"; 

const address = () => {
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
         <div className="sweet-loading bgRedGradient flex justify-center items-center h-screen">
           <PulseLoader
             color="#ffff"
             loading={loading}
             size={15}
             css={override}
             aria-label="Loading Spinner"
             data-testid="loader"
           />
         </div>
         ) : (
            <>
        {/* <div className={`${styles.paddingX} ${styles.flexCenter} relative z-30`}>
            <div className={`${styles.boxWidth}`}>
              <Navbar />
            </div>
        </div> */}
      {/* Konten Form */}
      {/* <div className="pt-20 px-4 bg-slate-400"> */}
        <SavedAddress />
      {/* </div> */}
        </>
    )}
    </div>
  );
};

export default address;
