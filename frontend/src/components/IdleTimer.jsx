import { useEffect, useCallback, useRef } from 'react';
import { performEcosystemLogout } from '../lib/authSync';

/**
 * Logs user out via central Gideon ID after inactivity.
 */
const IdleTimer = () => {
  const timeoutRef = useRef(null);

  let IDLE_TIMEOUT = (parseFloat(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES) || 30) * 60 * 1000;

  if (IDLE_TIMEOUT < 60000) {
    console.warn(`[IdleTimer] Provided timeout (${IDLE_TIMEOUT}ms) is too short. Defaulting to 1 minute.`);
    IDLE_TIMEOUT = 60000;
  }

  const handleLogout = useCallback(() => {
    console.warn('[AUTH] Session invalidated due to inactivity.');
    performEcosystemLogout();
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (localStorage.getItem('access_token')) {
      timeoutRef.current = setTimeout(handleLogout, IDLE_TIMEOUT);
    }
  }, [handleLogout, IDLE_TIMEOUT]);

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      console.log(`[IdleTimer] Active. Session will timeout after ${IDLE_TIMEOUT / 60000} minutes of inactivity.`);
    }

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click'
    ];

    resetTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  return null;
};

export default IdleTimer;
