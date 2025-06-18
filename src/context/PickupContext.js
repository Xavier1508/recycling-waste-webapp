import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket';
import FeedbackModal from '@/components/FeedbackModal';
import DriverFoundModal from '@/components/DriverFoundModal';
import { pickupAPI, userAPI } from '@/services/api';

const PickupContext = createContext();

export const usePickup = () => useContext(PickupContext);

export const PickupProvider = ({ children }) => {
  const [activePickup, setActivePickup] = useState(null);
  const [driverInfoForModal, setDriverInfoForModal] = useState(null);
  const [feedbackInfo, setFeedbackInfo] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userPoints, setUserPoints] = useState({ current_points: 0 });
  const [isPointsLoading, setIsPointsLoading] = useState(true);
  const fetchUserPoints = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        setUserPoints({ current_points: 0 });
        setIsPointsLoading(false);
        return;
    }
    try {
        setIsPointsLoading(true);
        const res = await userAPI.getPoints();
        setUserPoints(res.data);
    } catch (error) {
        console.error("Gagal mengambil poin dari Context:", error);
    } finally {
        setIsPointsLoading(false);
    }
  }, []);

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
    
    fetchUserPoints();
    setIsInitialized(true);
  }, [fetchUserPoints]);

  useEffect(() => {
    if (!isInitialized) return;

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.id || userData.role?.includes('driver')) {
      if (socket.connected) socket.disconnect();
      return;
    }

    if (!socket.connected) {
      socket.io.opts.query = { userId: userData.id };
      socket.connect();
      console.log(`[Socket] Attempting to connect for user: ${userData.id}`);
    }

    const handlePickupAccepted = (data) => {
      console.log('[Socket] Event "pickup_accepted" DITERIMA:', data);
      if (!data || !data.pickupId || !data.driver) {
        console.error('[PickupContext] Data "pickup_accepted" tidak lengkap.', data);
        return;
      }
      const newActivePickupData = {
        pickupId: data.pickupId,
        status: 'driver_found',
        status_message: 'Driver ditemukan dan sedang menuju lokasi Anda!',
        driver: data.driver,
        ...data, 
      };

      setDriverInfoForModal(newActivePickupData);
      
      setActivePickup(newActivePickupData);
      localStorage.setItem('activePickup', JSON.stringify(newActivePickupData));
      console.log('[PickupContext] State DIPERBARUI:', newActivePickupData);
    };

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
        if (activePickup && data.pickupId === activePickup.pickupId) {
            localStorage.removeItem('activePickup');
            setActivePickup(null);
            setFeedbackInfo(data);
            fetchUserPoints();
        }
    };

    const handlePointsUpdate = (newPointsData) => {
        console.log('[Socket] Poin diperbarui via WebSocket!', newPointsData);
        setUserPoints(newPointsData);
    };

    socket.on('connect', () => console.log(`[Socket] Connected with ID: ${socket.id}`));
    socket.on('disconnect', () => console.log('[Socket] Disconnected.'));
    socket.on('pickup_accepted', handlePickupAccepted);
    socket.on('pickup_status_update', handleStatusUpdate); 
    socket.on('pickup_completed', handlePickupCompleted);
    socket.on('points_updated', handlePointsUpdate);

    return () => {
      console.log('[Socket] Cleanup: Removing listeners and disconnecting.');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pickup_accepted', handlePickupAccepted);
      socket.off('pickup_status_update', handleStatusUpdate);
      socket.off('pickup_completed', handlePickupCompleted);
      socket.off('points_updated', handlePointsUpdate);
    };
  }, [isInitialized, activePickup, fetchUserPoints]);

  const startNewPickup = (pickupId) => {
    const newPickupData = { pickupId, status: 'searching' };
    localStorage.setItem('activePickup', JSON.stringify(newPickupData));
    setActivePickup(newPickupData);
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
    userPoints,
    isPointsLoading,
    fetchUserPoints,
  };

  return (
    <PickupContext.Provider value={value}>
      {children}
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