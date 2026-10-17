import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';
import { saveTokens } from '../lib/auth';

export function useAuth() {
  const navigate = useNavigate();
  const [phone, setPhone]         = useState('');
  const [otp, setOtp]             = useState('');
  const [step, setStep]           = useState('phone');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [devOtp, setDevOtp]       = useState(null);   // Dev Echo OTP for local testing
  const [provider, setProvider]   = useState('');     // Which provider succeeded
  const [resendCountdown, setResendCountdown] = useState(0); // Resend cooldown (seconds)
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authProvider, setAuthProvider] = useState('google');

  // Debounce guard — prevents rapid double-submit
  const sendingRef = useRef(false);

  // ─── Countdown timer after OTP send ──────────────────────────────────────
  const startResendCountdown = (seconds = 60) => {
    setResendCountdown(seconds);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ─── Normalize phone for Firebase ────────────────────────────────────────
  const formatPhone = (raw) => raw.includes('+') ? raw.trim() : `+91${raw.trim()}`;

  // ─── reCAPTCHA helper ─────────────────────────────────────────────────────
  const getOrCreateRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    return window.recaptchaVerifier;
  };

  // ─── PRIMARY SEND: Firebase first, then Fast2SMS fallback ────────────────
  const sendOtp = async (e) => {
    if (e) e.preventDefault();
    if (sendingRef.current) return;   // debounce
    sendingRef.current = true;

    setLoading(true);
    setError('');
    setDevOtp(null);

    const formattedPhone = formatPhone(phone);

    try {
      // ── Layer 1: Google Firebase Phone Auth ──────────────────────────────
      const verifier = getOrCreateRecaptcha();
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      setAuthProvider('google');
      setProvider('google');
      setStep('otp');
      startResendCountdown(60);
      console.log('[AUTH] ✅ Firebase OTP dispatched to', formattedPhone);

    } catch (firebaseErr) {
      const code = firebaseErr?.code || '';
      console.warn('[AUTH] ⚠️ Firebase failed:', code, firebaseErr.message);

      // Map Firebase error codes → human-readable for debugging
      const firebaseErrorMap = {
        'auth/unauthorized-domain':    '🔴 Firebase: Domain not authorized. Add tools.momen2.com to Firebase Console → Authentication → Settings → Authorized Domains.',
        'auth/too-many-requests':       '🔴 Firebase: Too many requests. Try again in a few minutes.',
        'auth/captcha-check-failed':    '🔴 Firebase: reCAPTCHA failed. Try refreshing the page.',
        'auth/invalid-phone-number':    '🔴 Firebase: Invalid phone number format.',
        'auth/missing-phone-number':    '🔴 Firebase: Phone number missing.',
        'auth/quota-exceeded':          '🔴 Firebase: SMS quota exceeded for today.',
        'auth/operation-not-allowed':   '🔴 Firebase: Phone sign-in not enabled. Go to Firebase Console → Authentication → Sign-in method → Enable Phone.',
      };
      if (firebaseErrorMap[code]) {
        console.error('[AUTH FIREBASE DIAGNOSIS]', firebaseErrorMap[code]);
      }

      // ── Layer 2 & 3: Backend Fast2SMS / Dev Echo ─────────────────────────
      try {
        const { data } = await api.post('auth/send-otp/', { phone_number: formattedPhone });
        setAuthProvider('native');
        setProvider(data.provider || 'fast2sms');
        setStep('otp');
        startResendCountdown(60);

        // DEV MODE: backend echoed back the OTP for developer testing
        if (data.dev_otp) {
          setDevOtp(data.dev_otp);
          setOtp(data.dev_otp);   // auto-fill the OTP field
          console.warn('[AUTH] 🛠 Dev Echo OTP auto-filled:', data.dev_otp);
        }

        console.log('[AUTH] ✅ Backend OTP dispatched via', data.provider);
      } catch (nativeErr) {
        const status = nativeErr?.response?.status;
        const msg    = nativeErr?.response?.data?.error;
        if (status === 429) {
          setError('Too many requests. Please wait 10 minutes before trying again.');
        } else {
          setError(msg || 'Could not send OTP. Check your number and try again.');
        }
      }
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  // ─── MANUAL BACKUP: Force Fast2SMS immediately ───────────────────────────
  const sendNativeOtp = async () => {
    if (sendingRef.current || resendCountdown > 0) return;
    sendingRef.current = true;
    setLoading(true);
    setError('');
    setDevOtp(null);

    const formattedPhone = formatPhone(phone);
    try {
      const { data } = await api.post('auth/send-otp/', { phone_number: formattedPhone });
      setAuthProvider('native');
      setProvider(data.provider || 'fast2sms');
      startResendCountdown(60);

      if (data.dev_otp) {
        setDevOtp(data.dev_otp);
        setOtp(data.dev_otp);
        console.warn('[AUTH] 🛠 Dev Echo OTP auto-filled:', data.dev_otp);
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.error;
      if (status === 429) {
        setError('Too many requests. Wait 10 minutes before retrying.');
      } else {
        setError(msg || 'Backup SMS failed. Please try again later.');
      }
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  // ─── VERIFY OTP ───────────────────────────────────────────────────────────
  const verifyOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const formattedPhone = formatPhone(phone);

    try {
      let payload = { phone_number: formattedPhone };

      // Emergency bypass: if user enters 123456, skip Firebase local check and verify against backend
      const isEmergencyBypass = otp.trim() === '123456';

      if (authProvider === 'google' && confirmationResult && !isEmergencyBypass) {
        const result  = await confirmationResult.confirm(otp.trim());
        const idToken = await result.user.getIdToken();
        payload.firebase_token = idToken;
      } else {
        payload.otp_code = otp.trim();
      }

      const { data } = await api.post('auth/verify-otp/', payload);
      saveTokens({ access: data.access, refresh: data.refresh });

      const idRes = await api.get('identity/me/', {
        headers: { Authorization: `Bearer ${data.access}` }
      });

      if (!idRes.data.is_setup_complete) {
        localStorage.removeItem('profile_complete');
        navigate('/setup-profile');
      } else {
        localStorage.setItem('profile_complete', 'true');
        navigate('/home');
      }
    } catch (err) {
      console.error('[AUTH] Verify error:', err);
      const msg = err?.response?.data?.error;
      setError(msg || 'Invalid code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    phone, setPhone,
    otp, setOtp,
    step, setStep,
    loading, error,
    devOtp, provider,
    resendCountdown,
    sendOtp, verifyOtp, sendNativeOtp,
  };
}
