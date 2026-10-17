import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import PurchaseKarmaModal from './PurchaseKarmaModal';
import api from '../lib/api';

export default function KarmaWallet() {
  const [karmaBalance, setKarmaBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchKarma = async () => {
    try {
      const res = await api.get('identity/me/');
      if (res.data.karma_balance !== undefined) {
        setKarmaBalance(res.data.karma_balance);
      }
    } catch (err) {
      console.error("Failed to fetch karma:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKarma();
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-colors group"
      >
        <Zap size={16} className="text-amber-500 fill-amber-500/20 group-hover:fill-amber-500/50 transition-colors" />
        <span className="font-bold text-amber-500">{loading ? '...' : karmaBalance}</span>
      </button>

      <PurchaseKarmaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onKarmaUpdated={(newBalance) => setKarmaBalance(newBalance)}
      />
    </>
  );
}
