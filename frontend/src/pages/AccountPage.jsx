import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import api from '../lib/api';
import { performEcosystemLogout } from '../lib/authSync';
import { COUNTRIES } from '../utils/countries';
import { useTheme } from '../context/ThemeContext';

export default function AccountPage() {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    first_name: "", last_name: "", profession: "", country: "", gender: "",
    day: "", month: "", year: "",
  });
  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("identity/me/")
      .then((res) => {
        let day = "", month = "", year = "";
        if (res.data.date_of_birth) {
          const parts = res.data.date_of_birth.split("-");
          year = parts[0]; month = parts[1]; day = parts[2];
        }
        const data = {
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          profession: res.data.profession || "",
          country: res.data.country || "",
          gender: res.data.gender || "",
          day, month, year,
        };
        setForm(data);
        setInitialForm(data);
      })
      .catch(() => setError("Could not load identity data."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(""); setError("");
  };

  const hasChanges = initialForm && JSON.stringify(form) !== JSON.stringify(initialForm);

  const saveProfile = async () => {
    if (!form.first_name || !form.gender || !form.profession || !form.country) {
      setError("First name, gender, profession, and country are required."); return;
    }
    setSaving(true); setError(""); setMessage("");
    try {
      const date_of_birth = form.year && form.month && form.day ? `${form.year}-${form.month}-${form.day}` : undefined;
      await api.post("identity/update/", {
        first_name: form.first_name, last_name: form.last_name,
        profession: form.profession, country: form.country,
        gender: form.gender, ...(date_of_birth && { date_of_birth }),
      });
      setInitialForm(form);
      setMessage("Identity synchronized successfully.");
    } catch (err) {
      setError(err?.response?.data?.error || "A network error occurred.");
    } finally { setSaving(false); }
  };

  const handleLogout = () => {
    performEcosystemLogout();
  };

  return (
    <div className="min-h-full p-6 md:p-12 lg:p-16">
      <div className="max-w-2xl mx-auto">

        <motion.header initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12 flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              {form.first_name?.charAt(0) || <User size={28} />}
            </div>
            <div>
              <h1 className={`text-4xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-[#1A1A1A]'
              }`}>Identity</h1>
              <p className={`mt-1 ${
                isDark ? 'text-zinc-500' : 'text-slate-600'
              }`}>Manage your universal profile parameters.</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold shrink-0">
            <LogOut size={15} /> Disconnect
          </button>
        </motion.header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

          {/* Security Alert */}
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs rounded-2xl p-5 mb-8 flex gap-3 leading-relaxed">
            <ShieldAlert className="shrink-0 mt-0.5" size={16} />
            <p><strong>Security Notice:</strong> Core identity parameters (Name, Gender, DOB) can only be modified a maximum of <strong>2 times every 365 days</strong> to prevent certificate fraud.</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4 mb-6">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 text-green-300 rounded-2xl p-4 mb-6">
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-400" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {loading ? (
            <div className={`text-center py-20 ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>Loading identity records…</div>
          ) : (
            <div className={`glass rounded-[2rem] p-8 border space-y-6 ${
              isDark ? 'border-white/5' : 'border-black/5'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${
                    isDark ? 'text-zinc-600' : 'text-slate-600'
                  }`}>Given Name</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" className={`w-full p-4 rounded-xl border focus:outline-none focus:border-amber-500/50 transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-[#1A1A1A]'
                  }`} />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${
                    isDark ? 'text-zinc-600' : 'text-slate-600'
                  }`}>Surname</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name (optional)" className={`w-full p-4 rounded-xl border focus:outline-none focus:border-amber-500/50 transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-[#1A1A1A]'
                  }`} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${
                    isDark ? 'text-zinc-600' : 'text-slate-600'
                  }`}>Core Profession</label>
                  <input name="profession" value={form.profession} onChange={handleChange} placeholder="e.g. Developer, Student, Designer" className={`w-full p-4 rounded-xl border focus:outline-none focus:border-amber-500/50 transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-[#1A1A1A]'
                  }`} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${
                    isDark ? 'text-zinc-600' : 'text-slate-600'
                  }`}>Resident Country</label>
                  <select name="country" value={form.country} onChange={handleChange} className={`w-full p-4 rounded-xl border focus:outline-none focus:border-amber-500/50 transition-colors ${
                    isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-100 border-black/10 text-[#1A1A1A]'
                  }`}>
                    <option value="" disabled>Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${
                    isDark ? 'text-zinc-600' : 'text-slate-600'
                  }`}>Gender</label>
                  <div className="grid grid-cols-3 gap-4">
                    {["male","female","other"].map((g) => (
                      <button key={g} onClick={() => handleChange({ target: { name:'gender', value: g } })}
                        className={`p-3 rounded-xl border transition-all text-sm font-bold capitalize ${
                          form.gender === g 
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                            : (isDark ? 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20' : 'bg-black/5 border-black/10 text-slate-600 hover:border-black/20')
                        }`}>
                        {g === "other" ? "Other" : g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${
                    isDark ? 'text-zinc-600' : 'text-slate-600'
                  }`}>Date of Birth</label>
                  <div className="grid grid-cols-3 gap-4">
                    <select name="month" value={form.month} onChange={handleChange} className={`p-4 rounded-xl border focus:outline-none focus:border-amber-500/50 transition-colors appearance-none ${
                      isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-100 border-black/10 text-[#1A1A1A]'
                    }`}>
                      <option value="" disabled>MM</option>
                      {[...Array(12)].map((_, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{new Date(0,i).toLocaleString('en',{month:'long'})}</option>)}
                    </select>
                    <select name="day" value={form.day} onChange={handleChange} className={`p-4 rounded-xl border focus:outline-none focus:border-amber-500/50 transition-colors appearance-none ${
                      isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-100 border-black/10 text-[#1A1A1A]'
                    }`}>
                      <option value="" disabled>DD</option>
                      {[...Array(31)].map((_, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{i+1}</option>)}
                    </select>
                    <select name="year" value={form.year} onChange={handleChange} className={`p-4 rounded-xl border focus:outline-none focus:border-amber-500/50 transition-colors appearance-none ${
                      isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-100 border-black/10 text-[#1A1A1A]'
                    }`}>
                      <option value="" disabled>YYYY</option>
                      {Array.from({length:100},(_,i)=>new Date().getFullYear()-10-i).map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t flex items-center justify-between ${
                isDark ? 'border-white/5' : 'border-black/5'
              }`}>
                <p className={`text-xs font-mono ${isDark ? 'text-zinc-700' : 'text-slate-700'}`}>Identity Core v1.0</p>
                <button onClick={saveProfile} disabled={saving || !hasChanges}
                  className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                    hasChanges 
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                      : (isDark ? 'bg-white/5 text-zinc-600 cursor-not-allowed' : 'bg-black/5 text-slate-600 cursor-not-allowed')
                  }`}>
                  {saving ? "Synchronizing…" : "Synchronize"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
