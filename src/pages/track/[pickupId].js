import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { pickupAPI } from '@/services/api';
import Navbar from '@/components/Navbar';
import styles from '@/style';
import { PulseLoader } from 'react-spinners';
import { FaArrowAltCircleLeft } from 'react-icons/fa';

const MapTracking = dynamic(() => import('@/components/MapTracking'), { 
    ssr: false,
    loading: () => <div className="h-[70vh] flex justify-center items-center"><PulseLoader color="#D93D41"/></div>
});

const TrackingPage = () => {
    const router = useRouter();
    const { pickupId } = router.query;
    const [pickupDetails, setPickupDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMapDataValid, setIsMapDataValid] = useState(false);

    useEffect(() => {
        if (!pickupId) return;

        const fetchDetails = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await pickupAPI.getDetails(pickupId);
                const details = response.data;

                console.log("DATA MENTAH DARI API:", details);
                if (details) {
                    console.log("Tipe data 'customer_latitude':", typeof details.customer_latitude);
                    console.log("Tipe data 'customer_longitude':", typeof details.customer_longitude);
                }
                
                if (details && details.customer_latitude && details.customer_longitude) {
                    const lat = parseFloat(details.customer_latitude);
                    const lon = parseFloat(details.customer_longitude);

                    if (!isNaN(lat) && !isNaN(lon)) {
                        setPickupDetails({
                            ...details,
                            customer_latitude: lat,
                            customer_longitude: lon,
                            driver_latitude: parseFloat(details.driver_latitude),
                            driver_longitude: parseFloat(details.driver_longitude),
                            tpa_latitude: parseFloat(details.tpa_latitude),
                            tpa_longitude: parseFloat(details.tpa_longitude),
                        });
                        setIsMapDataValid(true);
                    } else {
                        setError('Data lokasi customer tidak valid untuk ditampilkan.');
                        setIsMapDataValid(false);
                    }
                } else {
                    setError('Detail lokasi tidak ditemukan dalam data penjemputan.');
                    setIsMapDataValid(false);
                }

            } catch (err) {
                console.error("Gagal memuat detail pelacakan:", err);
                setError(err.response?.data?.error || 'Gagal memuat detail pelacakan.');
                setIsMapDataValid(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDetails();
    }, [pickupId]);

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className={`${styles.paddingX} ${styles.flexCenter} fixed w-full top-0 z-30 bg-white shadow-md`}>
                <div className={`${styles.boxWidth}`}><Navbar /></div>
            </div>
            <div className="pt-28 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-4">
                        <button onClick={() => router.back()} className="text-[#7c1215] font-semibold flex items-center text-sm hover:text-[#a03236]">
                            <FaArrowAltCircleLeft className="mr-2 text-3xl" /> <p className="text-base">Kembali</p>
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg min-h-[50vh] flex flex-col justify-center">
                        <h1 className="text-xl md:text-2xl font-bold text-center mb-4 text-gray-800">Lacak Penjemputan #{pickupId}</h1>
                        {isLoading && (
                            <div className="flex justify-center p-10"><PulseLoader color="#D93D41"/></div>
                        )}
                        {!isLoading && error && (
                            <p className="text-center text-red-500 py-10 font-semibold">{error}</p>
                        )}
                        {!isLoading && !error && isMapDataValid && pickupDetails && (
                            <MapTracking details={pickupDetails} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackingPage;