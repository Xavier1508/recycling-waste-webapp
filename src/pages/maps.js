import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import styles from '@/style';
import { PulseLoader } from 'react-spinners';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex justify-center items-center">
            <PulseLoader color="#D93D41" />
        </div>
    ),
});

const MapsPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className={`${styles.paddingX} ${styles.flexCenter} fixed top-0 left-0 right-0 z-30 bg-white shadow-md`}>
                <div className={`${styles.boxWidth}`}>
                    <Navbar />
                </div>
            </div>
            <div className="pt-24">
                <MapDisplay />
            </div>
        </div>
    );
};

export default MapsPage;
