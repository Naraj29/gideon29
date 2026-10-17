import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import api from '../lib/api';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export default function PurchaseKarmaModal({ isOpen, onClose, onKarmaUpdated }) {
  const [karmaAmount, setKarmaAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState("");

  const PRICE_PER_KARMA = 2; // INR

  useEffect(() => {
    if (!isOpen) return;
    
    // Dynamically load Razorpay SDK
    const loadRazorpay = () => {
      if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError("Failed to load payment gateway. Please check your connection.");
      document.body.appendChild(script);
    };
    
    loadRazorpay();
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!scriptLoaded) {
      setError("Payment system initializing. Please wait...");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // 1. Create order on our backend
      const { data } = await api.post('payments/create-order/', { karma_amount: karmaAmount });
      
      // 2. Initialize Razorpay options
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Universal Companion",
        description: `Purchase ${data.karma_reward} Karma`,
        order_id: data.order_id,
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            const verifyRes = await api.post('payments/verify/', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            
            // 4. Update UI
            if (onKarmaUpdated) onKarmaUpdated(verifyRes.data.new_karma_balance);
            onClose();
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: "UC User",
          theme: {
            color: "#f59e0b" // Amber-500
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setError(response.error.description);
      });
      razorpayInstance.open();

    } catch (err) {
      setError(err?.response?.data?.error || "Failed to initialize payment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] p-4 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center">
      <div className="w-full max-w-md my-auto bg-[#121212] border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)] relative animate-in fade-in zoom-in duration-300 mt-10 mb-10">
        
        {/* Content Container */}
        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Zap className="text-amber-500 fill-amber-500/20" size={24} />
                </div>
                Recharge Karma
              </h2>
              <p className="text-zinc-400 text-sm mt-2 font-medium">Unlock premium AI features and bypass system limits.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
           {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl flex items-center gap-2">
              <X size={16} className="shrink-0" /> {error}
            </div>
           )}

            {/* Karma Calculator */}
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] -mr-10 -mt-10" />
              
              <label className="text-xs font-bold text-amber-500/80 uppercase tracking-widest">Select Amount</label>
              <div className="flex items-center gap-4 mt-4 relative z-10">
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={karmaAmount}
                  onChange={(e) => setKarmaAmount(Number(e.target.value))}
                  className="w-1/2 p-4 bg-black/50 border border-white/10 rounded-xl text-3xl font-black text-white focus:outline-none focus:border-amber-500/50 text-center transition-colors"
                />
                <div className="w-1/2 text-right">
                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Cost</div>
                  <div className="text-3xl font-black text-white truncate text-amber-500 shadow-sm">₹{karmaAmount * PRICE_PER_KARMA}</div>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex gap-3">
              {[50, 100, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => setKarmaAmount(amt)}
                  className="flex-1 py-3 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-bold transition-all text-sm border border-white/5 hover:border-white/10 hover:shadow-lg active:scale-95"
                >
                  + {amt} k
                </button>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 opacity-60">
               <div className="flex items-center gap-2 text-xs font-medium text-white">
                  <ShieldCheck size={16} className="text-emerald-400" /> 256-bit Secure
               </div>
               <div className="flex items-center gap-2 text-xs font-medium text-white">
                  <CreditCard size={16} className="text-blue-400" /> Razorpay Verified
               </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={handlePurchase}
                disabled={loading || karmaAmount < 1}
                className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg active:scale-[0.98] shadow-xl hover:shadow-2xl"
              >
                {loading ? <Loader2 className="animate-spin text-black" size={24} /> : <>Initialize Secure Payment <Zap size={20} className="fill-black/30" /></>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
