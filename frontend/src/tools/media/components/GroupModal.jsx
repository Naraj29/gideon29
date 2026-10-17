import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export default function GroupModal({ isOpen, onClose, onSave, initialData, parentId }) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    parent_group: parentId || null
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          image_url: initialData.image_url || '',
          parent_group: initialData.parent_group || parentId || null
        });
      } else {
        setFormData({
          name: '',
          description: '',
          image_url: '',
          parent_group: parentId || null
        });
      }
    }
  }, [isOpen, initialData, parentId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      parent_id: formData.parent_group || parentId || null,
      parent_group: formData.parent_group || parentId || null
    });
  };

  const inputClass = `w-full border rounded-2xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-fuchsia-500/50 ${
    isDark ? 'bg-black/40 border-white/10 text-white placeholder:text-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`border rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 sm:p-10 shadow-2xl relative ${
            isDark ? 'bg-[#18181b] border-white/10 text-white shadow-black/50' : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/10'
          }`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className={`text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <FolderPlus className="text-fuchsia-500" />
              {initialData ? 'Edit Folder' : 'New Folder'}
            </h2>
            <button onClick={onClose} className={`p-3 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-black/5 text-slate-500 hover:text-black'
            }`}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Folder Name *</label>
              <input 
                required
                type="text" 
                placeholder="e.g. DCEU Movies"
                className={inputClass}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Description</label>
              <textarea 
                rows="2"
                placeholder="Optional description"
                className={`${inputClass} resize-none`}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Cover Image URL</label>
              <input 
                type="url" 
                placeholder="https://..."
                className={inputClass}
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                type="button" 
                onClick={onClose}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black'
                }`}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-4 px-6 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold transition-all shadow-lg shadow-fuchsia-600/20 active:scale-95"
              >
                {initialData ? 'Update Folder' : 'Create Folder'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
