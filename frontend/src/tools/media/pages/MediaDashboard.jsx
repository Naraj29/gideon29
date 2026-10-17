import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  FolderPlus, 
  Plus, 
  ChevronRight, 
  Trash2,
  FolderOpen,
  Download,
  Upload
} from 'lucide-react';

import mediaService from '../services/mediaService';
import GroupModal from '../components/GroupModal';
import ItemModal from '../components/ItemModal';
import MediaCards from '../components/MediaCards';
import { useTheme } from '../../../context/ThemeContext';

export default function MediaDashboard() {
  const { parentId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [parentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentParent = parentId || 'root';
      
      const [groupsRes, itemsRes, crumbsRes] = await Promise.all([
        mediaService.getGroups(currentParent),
        mediaService.getItems({ group_id: currentParent === 'root' ? '' : currentParent }),
        currentParent !== 'root' ? mediaService.getBreadcrumbs(currentParent) : { breadcrumbs: [] }
      ]);

      setGroups(groupsRes.results || groupsRes);
      setItems(itemsRes.results || itemsRes);
      setBreadcrumbs(crumbsRes.breadcrumbs || []);

    } catch (err) {
      console.error("Failed to fetch media data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Group Handlers ---
  const handleSaveGroup = async (data) => {
    try {
      if (editingGroup) {
        await mediaService.updateGroup(editingGroup.id, data);
        showToast("Folder updated successfully!");
      } else {
        await mediaService.createGroup(data);
        showToast("Folder created successfully!");
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      fetchData();
    } catch (err) {
      console.error("Failed to save group:", err);
      showToast(err.response?.data?.detail || "Failed to save folder", "error");
    }
  };

  const handleDeleteGroup = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this folder and ALL its contents?")) return;
    try {
      await mediaService.deleteGroup(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete group:", err);
    }
  };

  const openGroupEditor = (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  // --- Item Handlers ---
  const handleSaveItem = async (data) => {
    try {
      if (editingItem) {
        await mediaService.updateItem(editingItem.id, data);
        showToast("Media unit updated successfully!");
      } else {
        await mediaService.createItem(data);
        showToast("Media unit saved successfully!");
      }
      setIsItemModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error("Failed to save item:", err);
      const errors = err.response?.data;
      let msg = "Failed to save media unit";
      if (errors && typeof errors === 'object') {
        const errorMsgs = Object.entries(errors).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`);
        if (errorMsgs.length > 0) {
          msg = errorMsgs.join(' | ');
        }
      }
      showToast(msg, "error");
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this media unit?")) return;
    try {
      await mediaService.deleteItem(id);
      fetchData();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const openItemEditor = (item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const data = await mediaService.exportData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("download", `media_tracker_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Backup downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || "Failed to export backup data", "error");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Importing data will restore files and folders from backup. Are you sure you want to proceed?")) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileContent = JSON.parse(event.target.result);
        if (!fileContent.groups || !fileContent.items) {
          throw new Error("Invalid backup file format. Must contain groups and items.");
        }
        await mediaService.importData(fileContent);
        showToast("Backup imported successfully!");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.detail || err.message || "Failed to import backup data", "error");
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto pb-16 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="w-full">
        {/* Header & Breadcrumbs */}
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 flex-wrap">
             <Link to="/tools/media" className={isDark ? "text-cyan-400 hover:text-cyan-300 transition-colors" : "text-cyan-600 hover:text-cyan-700 transition-colors"}>
               Media Root
             </Link>
             {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight size={14} className={isDark ? "text-zinc-600" : "text-slate-400"} />
                  <Link 
                    to={`/tools/media/group/${crumb.id}`}
                    className={`${idx === breadcrumbs.length - 1 ? (isDark ? 'text-white font-bold' : 'text-slate-900 font-bold') : (isDark ? 'text-zinc-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600')} transition-colors`}
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
             ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <Film className="w-8 h-8 text-cyan-500 shrink-0" /> 
                {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Media Library'}
              </h1>
              <p className={`mt-1 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Curated universe collection of movies, series, games, and literature. Offline-first & instantaneous.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button 
                onClick={handleExport}
                title="Download Backup"
                className={`flex items-center justify-center p-2.5 rounded-2xl transition-all border ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10' : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-black border-slate-200 shadow-sm'
                }`}
              >
                <Download className="w-4 h-4" />
              </button>
              <label 
                title="Upload Backup"
                className={`flex items-center justify-center p-2.5 rounded-2xl transition-all border cursor-pointer ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10' : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-black border-slate-200 shadow-sm'
                }`}
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImport}
                />
              </label>

              <button 
                onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all text-sm font-bold border ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                Folder
              </button>
              <button 
                onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-2xl transition-all text-sm font-bold shadow-md shadow-cyan-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Unit
              </button>
            </div>
          </div>
        </header>

        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
           </div>
        ) : (
           <div className="space-y-10">
             
             {/* Subfolders Grid */}
             {groups.length > 0 && (
                <section>
                   <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 pl-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                     Folders & Universes
                   </h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <AnimatePresence>
                         {groups.map((group, index) => (
                            <motion.div
                              key={group.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => navigate(`/tools/media/group/${group.id}`)}
                              className={`group cursor-pointer relative border rounded-3xl p-5 transition-all flex items-center gap-4 overflow-hidden ${
                                isDark 
                                  ? 'bg-[#18181b] border-white/8 hover:border-cyan-500/40 hover:bg-[#1c1c20] shadow-lg shadow-black/20' 
                                  : 'bg-white border-slate-200/90 shadow-sm hover:border-cyan-500/50 hover:shadow-md'
                              }`}
                            >
                               {group.image_url ? (
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                                     <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
                                  </div>
                               ) : (
                                  <div className="w-12 h-12 bg-cyan-500/10 text-cyan-500 rounded-2xl flex items-center justify-center shrink-0">
                                     <FolderOpen size={24} />
                                  </div>
                               )}
                               
                               <div className="min-w-0 flex-1">
                                  <h3 className={`font-bold truncate transition-colors ${
                                    isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-600'
                                  }`}>{group.name}</h3>
                                  <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{group.description || 'Folder'}</p>
                                </div>

                               <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => openGroupEditor(group, e)} className={`p-2 rounded-xl transition-colors ${
                                    isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-black'
                                  }`}>
                                     <span className="text-[10px] font-bold">Edit</span>
                                  </button>
                                  <button onClick={(e) => handleDeleteGroup(group.id, e)} className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors">
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </motion.div>
                         ))}
                      </AnimatePresence>
                   </div>
                </section>
             )}

             {/* Media Items */}
             <section>
                <div className="flex items-center justify-between mb-4 pl-1">
                   <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                     Media Units
                   </h2>
                   <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                     {items.length} Tracked
                   </span>
                </div>
                
                <MediaCards 
                  items={items} 
                  onEdit={openItemEditor} 
                  onDelete={handleDeleteItem} 
                />
             </section>

           </div>
        )}
      </div>

      {/* Modals */}
      <GroupModal 
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleSaveGroup}
        initialData={editingGroup}
        parentId={parentId === 'root' ? null : parentId}
      />

      <ItemModal 
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        groupId={parentId === 'root' ? null : parentId}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[110] px-6 py-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 border ${
              toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
            } backdrop-blur-md`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'} animate-pulse`} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
