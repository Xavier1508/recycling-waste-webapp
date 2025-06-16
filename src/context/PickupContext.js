import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket'; // Pastikan path ini benar
import FeedbackModal from '@/components/FeedbackModal';
import DriverFoundModal from '@/components/DriverFoundModal'; // <-- Impor modal baru
import { pickupAPI } from '@/services/api';

const PickupContext = createContext();

export const usePickup = () => useContext(PickupContext);

export const PickupProvider = ({ children }) => {
  const [activePickup, setActivePickup] = useState(null);
  const [driverInfoForModal, setDriverInfoForModal] = useState(null); // <-- State untuk modal sementara
  const [feedbackInfo, setFeedbackInfo] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Efek untuk memuat state dari localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    try {
      const savedPickup = localStorage.getItem('activePickup');
      if (savedPickup) {
        setActivePickup(JSON.parse(savedPickup));
      }
    } catch (error) {
      console.error("Gagal memuat pickup dari localStorage", error);
      localStorage.removeItem('activePickup');
    }
    setIsInitialized(true);
  }, []);

  // --- BLOK UTAMA PERBAIKAN ---
  // useEffect ini sekarang bertanggung jawab penuh atas koneksi socket.
  useEffect(() => {
    // Jangan jalankan logika socket sebelum state diinisialisasi dari localStorage.
    if (!isInitialized) return;

    // Ambil data user. Jika tidak ada, jangan lakukan apa-apa.
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.id || userData.role?.includes('driver')) {
      // Jika sudah ada koneksi sebelumnya, putuskan.
      if (socket.connected) socket.disconnect();
      return;
    }

    // --- LOGIKA KONEKSI ---
    // Jika socket belum terkoneksi, kita setup dan koneksikan SEKARANG.
    if (!socket.connected) {
      // Setel query 'userId' untuk otentikasi di backend.
      socket.io.opts.query = { userId: userData.id };
      socket.connect();
      console.log(`[Socket] Attempting to connect for user: ${userData.id}`);
    }

    // --- EVENT LISTENERS ---
    // --- Handler untuk memunculkan modal "Driver Ditemukan" ---
    const handlePickupAccepted = (data) => {
      console.log('[Socket] Event "pickup_accepted" RECEIVED:', data);
      if (data?.driver) {
        setDriverInfoForModal(data); // <-- Tampilkan modal dengan info driver
      }
      setActivePickup(currentActivePickup => {
        if (currentActivePickup && currentActivePickup.pickupId === data?.pickupId && data?.driver) {
          const newActivePickupData = { ...currentActivePickup, ...data, status: 'driver_found', status_message: 'Driver sedang menuju lokasi Anda...' };
          localStorage.setItem('activePickup', JSON.stringify(newActivePickupData));
          console.log('[PickupContext] State UPDATED to driver_found:', newActivePickupData);
          return newActivePickupData;
        }
        return currentActivePickup;
      });
    };

    // --- Handler BARU untuk update status perjalanan ---
    const handleStatusUpdate = (data) => {
        console.log('[Socket] Event "pickup_status_update" RECEIVED:', data);
        setActivePickup(current => {
            if (current && current.pickupId === data.pickupId && current.status_message !== data.status_message) {
                const newActiveData = { ...current, status_message: data.status_message };
                localStorage.setItem('activePickup', JSON.stringify(newActiveData));
                return newActiveData;
            }
            return current;
        });
    };

    const handlePickupCompleted = (data) => {
        console.log('[Socket] Event "pickup_completed" RECEIVED:', data);
        setActivePickup(currentActivePickup => {
            if (currentActivePickup && data.pickupId === currentActivePickup.pickupId) {
                localStorage.removeItem('activePickup');
                setFeedbackInfo(data);
                return null;
            }
            return currentActivePickup;
        });
    };

    // Daftarkan semua event listener
    socket.on('connect', () => console.log(`[Socket] Connected with ID: ${socket.id}`));
    socket.on('disconnect', () => console.log('[Socket] Disconnected.'));
    socket.on('pickup_accepted', handlePickupAccepted);
    socket.on('pickup_status_update', handleStatusUpdate); // <-- Dengarkan event baru
    socket.on('pickup_completed', handlePickupCompleted);

    // --- FUNGSI CLEANUP ---
    // Fungsi ini akan berjalan ketika komponen dibongkar (unmount) atau dependensi berubah.
    return () => {
      console.log('[Socket] Cleanup: Removing listeners and disconnecting.');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pickup_accepted', handlePickupAccepted);
      socket.off('pickup_status_update', handleStatusUpdate);
      socket.off('pickup_completed', handlePickupCompleted);
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isInitialized]); // Dependensi tetap [isInitialized] agar logika ini dievaluasi ulang saat app siap.

  const startNewPickup = (pickupId) => {
    const newPickupData = { pickupId, status: 'searching' };
    localStorage.setItem('activePickup', JSON.stringify(newPickupData));
    setActivePickup(newPickupData);
    // Pastikan socket terkoneksi saat memulai pickup baru
    if (!socket.connected) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData?.id && !userData.role?.includes('driver')) {
            socket.io.opts.query = { userId: userData.id };
            socket.connect();
            console.log('[Socket] Force connect on startNewPickup.');
        }
    }
  };

  const clearActivePickup = () => {
    localStorage.removeItem('activePickup');
    setActivePickup(null);
    if (socket.connected) {
      socket.disconnect();
    }
    console.log('[PickupContext] Active pickup cleared on logout.');
  };

  const handleSubmitFeedback = async (feedbackPayload) => {
    if (!feedbackInfo?.pickupId) return;
    setIsSubmittingFeedback(true);
    try {
        await pickupAPI.submitFeedback(feedbackInfo.pickupId, feedbackPayload);
        alert("Terima kasih atas ulasan Anda!");
        setFeedbackInfo(null);
    } catch (err) {
        console.error("Gagal mengirim feedback:", err);
        alert(err.response?.data?.error || "Gagal mengirim ulasan.");
    } finally {
        setIsSubmittingFeedback(false);
    }
  };

  const value = { 
    activePickup, 
    startNewPickup, 
    feedbackInfo,
    handleSubmitFeedback,
    isSubmittingFeedback,
    clearActivePickup,
  };

  return (
    <PickupContext.Provider value={value}>
      {children}
      {/* --- Render kedua modal di sini --- */}
      {driverInfoForModal && (
        <DriverFoundModal 
          pickupData={driverInfoForModal}
          onClose={() => setDriverInfoForModal(null)} 
        />
      )}
      {feedbackInfo && (
        <FeedbackModal 
            pickupId={feedbackInfo.pickupId}
            tpaName={feedbackInfo.tpa?.name || 'Fasilitas Kami'}
            pointsEarned={feedbackInfo.points_earned || 0}
            onSubmit={handleSubmitFeedback}
            onClose={() => setFeedbackInfo(null)}
            isSubmitting={isSubmittingFeedback}
        />
      )}
    </PickupContext.Provider>
  );
};