import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { LogIn, Phone, KeyRound, Sparkles } from 'lucide-react';

export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('auth/send-otp/', { phone_number: phoneNumber });
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please check the number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('auth/verify-otp/', { 
        phone_number: phoneNumber, 
        otp_code: otp 
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // 🟢 Identity Gate Check
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
      setError('Invalid OTP code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItem: 'center', justifyContent: 'center', background: 'var(--accent-color)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}>
                <Sparkles size={32} color="white" />
            </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Diary Access</h2>
          <p>Login to your personal space.</p>
        </div>

        {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {error}
            </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="fade-in stagger-1">
            <div className="form-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890" 
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn" style={{ width: '100%' }}>
              {loading ? 'Sending...' : 'Request OTP'} <LogIn size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="fade-in stagger-2">
            <div className="form-group">
              <label>OTP Code</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code (dev: 123456)" 
                  required
                  style={{ paddingLeft: '2.5rem', letterSpacing: '2px' }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn" style={{ width: '100%' }}>
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
