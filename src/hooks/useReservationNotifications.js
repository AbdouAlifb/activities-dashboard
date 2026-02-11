import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://activities.cardnd.com';

export const useReservationNotifications = (userRole) => {
  const [hasNewReservations, setHasNewReservations] = useState(false);
  const [newReservationsCount, setNewReservationsCount] = useState(0);
  const socketRef = useRef(null);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    if (!userRole || (userRole !== 'Super Admin' && userRole !== 'Agency Admin')) {
      return;
    }

    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found for WebSocket connection');
      return;
    }

    console.log('🔌 Connecting to WebSocket server...');

    // Connect to Socket.IO server with authentication
    const socket = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket:', reason);
    });

    // Listen for new reservation events
    socket.on('newReservation', (data) => {
      console.log('📬 New reservation received:', data);

      setNewReservationsCount(prev => prev + 1);
      setHasNewReservations(true);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('New Reservation', {
          body: `New reservation from ${data.reservation.customer_name || 'a customer'}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'reservation-notification',
          renotify: true
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Play notification sound (optional)
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.log('Could not play sound:', e));
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, [userRole]);

  // Update page title when notifications change
  useEffect(() => {
    if (hasNewReservations && newReservationsCount > 0) {
      document.title = `(${newReservationsCount}) New Reservation${newReservationsCount > 1 ? 's' : ''} - Dashboard`;
    } else {
      document.title = 'Dashboard';
    }
  }, [hasNewReservations, newReservationsCount]);

  const markAsSeen = useCallback(() => {
    setHasNewReservations(false);
    setNewReservationsCount(0);
    document.title = 'Dashboard';
  }, []);

  return {
    hasNewReservations,
    newReservationsCount,
    markAsSeen,
    socket: socketRef.current
  };
};
