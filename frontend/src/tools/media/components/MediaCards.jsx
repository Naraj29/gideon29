import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, Clock, PlayCircle, MoreHorizontal, Video, Book, Gamepad2, Mic, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const getIconForType = (type) => {
  switch (type) {
    case 'Movie':
    case 'Series':
    case 'Anime':
      return <Video className="w-4 h-4" />;
    case 'Book':
    case 'Comic':
      return <Book className="w-4 h-4" />;
    case 'Game':
      return <Gamepad2 className="w-4 h-4" />;
    case 'Podcast':
      return <Mic className="w-4 h-4" />;
    default:
      return <ImageIcon className="w-4 h-4" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'Completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Planning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'Dropped': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    case 'OnHold': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    default: return 'bg-white/5 text-gray-400 border-white/10';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Active': return <PlayCircle className="w-3 h-3" />;
    case 'Completed': return <CheckCircle2 className="w-3 h-3" />;
    case 'Planning': return <Clock className="w-3 h-3" />;
    default: return <MoreHorizontal className="w-3 h-3" />;
  }
};

export default function MediaCards({ items, onEdit, onDelete }) {
  const { isDark } = useTheme();

  if (!items || items.length === 0) {
    return (
      <div className={`text-center py-20 border-2 border-dashed rounded-[2.5rem] ${
        isDark ? 'border-white/5 bg-white/[0.01]' : 'border-slate-200 bg-white/50'
      }`}>
        <Video className="w-16 h-16 text-slate-400 dark:text-gray-700 mx-auto mb-4" />
        <h3 className={`text-xl font-bold ${isDark ? 'text-gray-400' : 'text-slate-800'}`}>No Media Units</h3>
        <p className={`mt-1 text-sm ${isDark ? 'text-gray-600' : 'text-slate-500'}`}>Add your first movie, series, or book.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onEdit(item)}
            className={`group relative border rounded-[2rem] overflow-hidden cursor-pointer transition-all flex flex-col h-full ${
              isDark ? 'bg-[#18181b] border-white/8 hover:border-cyan-500/40 shadow-lg shadow-black/20' : 'bg-white border-slate-200/90 hover:border-cyan-500/50 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Poster Image */}
            <div className="aspect-[2/3] w-full bg-black/40 relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  {getIconForType(item.media_type)}
                </div>
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

              {/* Badges */}
              <div className="absolute top-4 w-full px-4 flex justify-between items-start">
                <div className="flex gap-2">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status === 'OnHold' ? 'On Hold' : item.status}
                  </div>
                </div>

                {item.is_favorite && (
                  <div className="bg-amber-500 text-black p-1.5 rounded-full shadow-lg shadow-amber-500/20">
                    <Star className="w-3 h-3 fill-black text-black" />
                  </div>
                )}
              </div>

              {/* Details (Absolute inside image area) */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1.5 drop-shadow-md">
                  {getIconForType(item.media_type)} 
                  {item.media_type} {item.start_year && `• ${item.start_year}`}
                </div>
                <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </div>

            {/* Bottom metadata */}
            <div className={`p-4 flex items-center justify-between border-t relative z-10 hidden group-hover:flex ${
              isDark ? 'bg-[#18181b] border-white/5' : 'bg-white border-slate-100'
            }`}>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                  {item.rating ? (
                    <><Star className="w-3 h-3 fill-amber-500" /> {item.rating}/10</>
                  ) : (
                    <span className="text-gray-600">No Rating</span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id, e);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest"
                >
                  Delete
                </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
