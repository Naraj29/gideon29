import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus } from 'lucide-react';

export default function GroupModal({ isOpen, onClose, onSave, initialData, parentId }) {
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
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 sm:p-10 shadow-2xl shadow-black/50 relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <FolderPlus className="text-fuchsia-400" />
              {initialData ? 'Edit Folder' : 'New Folder'}
            </h2>
            <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
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
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-fuchsia-500 transition-all outline-none placeholder:text-zinc-600"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Description</label>
              <textarea 
                rows="2"
                placeholder="Optional description"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-fuchsia-500 transition-all outline-none resize-none placeholder:text-zinc-600"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Cover Image URL</label>
              <input 
                type="url" 
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-fuchsia-500 transition-all outline-none placeholder:text-zinc-600"
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-4 px-6 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold transition-all shadow-lg shadow-fuchsia-600/20"
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
