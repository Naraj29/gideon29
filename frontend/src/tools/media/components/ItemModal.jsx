import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film } from 'lucide-react';
import mediaService from '../services/mediaService';
import { useTheme } from '../../../context/ThemeContext';

const MEDIA_TYPES = ["Movie", "Series", "Anime", "Comic", "Book", "Game", "Podcast", "Other"];
const STATUS_CHOICES = ["Planning", "Active", "Completed", "Dropped", "OnHold"];

export default function ItemModal({ isOpen, onClose, onSave, initialData, groupId }) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    media_type: 'Movie',
    category: '',
    language: '',
    country: '',
    start_year: '',
    end_year: '',
    is_favorite: false,
    status: 'Planning',
    rating: '',
    image_url: '',
    notes: '',
    group: groupId || null
  });

  const DEFAULT_MEDIA_TYPES = ["Movie", "Series", "Anime", "Comic", "Book", "Game", "Podcast", "Other"];
  const [existingCategories, setExistingCategories] = useState([]);
  const [existingMediaTypes, setExistingMediaTypes] = useState(DEFAULT_MEDIA_TYPES);
  const [showCustomMediaType, setShowCustomMediaType] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch categories
      mediaService.getCategories()
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.results || []);
          setExistingCategories(list);
        })
        .catch(err => console.error("Failed to load categories:", err));

      // 2. Fetch media types & reset custom media type toggler
      const initialType = initialData?.media_type || 'Movie';
      const baseList = [...DEFAULT_MEDIA_TYPES];
      if (initialType && !baseList.includes(initialType)) {
        baseList.push(initialType);
        setShowCustomMediaType(true);
      } else {
        setShowCustomMediaType(false);
      }
      setExistingMediaTypes(baseList);

      mediaService.getMediaTypes()
        .then(res => {
          const typesList = Array.isArray(res) ? res : (res?.results || []);
          const merged = Array.from(new Set([...DEFAULT_MEDIA_TYPES, ...typesList]));
          if (initialType && !merged.includes(initialType)) {
            merged.push(initialType);
          }
          setExistingMediaTypes(merged);
        })
        .catch(err => console.error("Failed to load media types:", err));

      // 3. Set form data
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          media_type: initialData.media_type || 'Movie',
          category: initialData.category || '',
          language: initialData.language || '',
          country: initialData.country || '',
          start_year: initialData.start_year || '',
          end_year: initialData.end_year || '',
          is_favorite: initialData.is_favorite || false,
          status: initialData.status || 'Planning',
          rating: initialData.rating || '',
          image_url: initialData.image_url || '',
          notes: initialData.notes || '',
          group: initialData.group || groupId || null
        });
      } else {
        setFormData({
          title: '',
          media_type: 'Movie',
          category: '',
          language: '',
          country: '',
          start_year: '',
          end_year: '',
          is_favorite: false,
          status: 'Planning',
          rating: '',
          image_url: '',
          notes: '',
          group: groupId || null
        });
      }
    }
  }, [isOpen, initialData, groupId]);

  const toggleCategory = (cat) => {
    const currentCats = formData.category
      ? formData.category.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    let newCats;
    if (currentCats.includes(cat)) {
      newCats = currentCats.filter(c => c !== cat);
    } else {
      newCats = [...currentCats, cat];
    }
    
    setFormData({
      ...formData,
      category: newCats.join(', ')
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean numeric fields: empty strings must be null, otherwise integers
    const cleanedData = {
      ...formData,
      group: formData.group || groupId || null,
      group_id: formData.group || groupId || null,
      rating: formData.rating === '' ? null : parseInt(formData.rating, 10),
      start_year: formData.start_year === '' ? null : parseInt(formData.start_year, 10),
      end_year: formData.end_year === '' ? null : parseInt(formData.end_year, 10),
    };
    
    onSave(cleanedData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 sm:p-10 shadow-2xl shadow-black/50 relative my-auto"
        >
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Film className="text-cyan-400" />
              {initialData ? 'Edit Media Unit' : 'Add Media Unit'}
            </h2>
            <button type="button" onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Title *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Interstellar"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none placeholder:text-zinc-600"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Media Type</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none appearance-none"
                  value={showCustomMediaType ? '__custom__' : formData.media_type}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setShowCustomMediaType(true);
                      setFormData({...formData, media_type: ''});
                    } else {
                      setShowCustomMediaType(false);
                      setFormData({...formData, media_type: e.target.value});
                    }
                  }}
                >
                  {existingMediaTypes.map(type => (
                    <option key={type} value={type} className="bg-[#1c1c1e] text-white">{type}</option>
                  ))}
                  <option value="__custom__" className="bg-[#1c1c1e] text-cyan-400 font-bold">+ Custom Type...</option>
                </select>
                
                {showCustomMediaType && (
                  <input 
                    type="text" 
                    placeholder="e.g. Documentary"
                    className="w-full mt-3 bg-black/40 border border-cyan-500/30 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none placeholder:text-zinc-600"
                    value={formData.media_type}
                    onChange={e => setFormData({...formData, media_type: e.target.value})}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Status</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none appearance-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  {STATUS_CHOICES.map(status => (
                    <option key={status} value={status} className="bg-[#1c1c1e] text-white">
                      {status === 'OnHold' ? 'On Hold' : status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Genre / Category</label>
                <input 
                  type="text" 
                  placeholder="Sci-Fi"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none placeholder:text-zinc-600"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
                {existingCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                    {existingCategories.map(cat => {
                      const isActive = formData.category
                        ? formData.category.split(',').map(s => s.trim()).includes(cat)
                        : false;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
                            isActive 
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold' 
                              : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Rating (1-10)</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  placeholder="e.g. 9"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none placeholder:text-zinc-600"
                  value={formData.rating}
                  onChange={e => setFormData({...formData, rating: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Poster / Cover Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none placeholder:text-zinc-600"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">Personal Notes</label>
                <textarea 
                  rows="2"
                  placeholder="Thoughts, reviews, quotes..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-cyan-500 transition-all outline-none resize-none placeholder:text-zinc-600"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox"
                id="is_favorite"
                checked={formData.is_favorite}
                onChange={e => setFormData({...formData, is_favorite: e.target.checked})}
                className="w-5 h-5 accent-cyan-500 bg-white/5 border-white/10 rounded"
              />
              <label htmlFor="is_favorite" className="text-sm font-bold text-gray-300 cursor-pointer select-none">Mark as Favorite / Masterpiece</label>
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
                className="flex-1 py-4 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-600/20"
              >
                {initialData ? 'Update Unit' : 'Add Unit'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
