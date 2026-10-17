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

export default function MediaDashboard() {
  const { parentId } = useParams();
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        {/* Header & Breadcrumbs */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-500 mb-6 flex-wrap">
             <Link to="/tools/media" className="hover:text-cyan-400 transition-colors">Media Root</Link>
             {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  <ChevronRight size={14} className="text-gray-600" />
                  <Link 
                    to={`/tools/media/group/${crumb.id}`}
                    className={`${idx === breadcrumbs.length - 1 ? 'text-white' : 'hover:text-cyan-400'} transition-colors`}
                  >
                    {crumb.name}
                  </Link>
                </React.Fragment>
             ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-4">
                <Film className="w-10 h-10 text-cyan-400" /> 
                {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Media Library'}
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Your curated collection of universes and stories.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExport}
                title="Download Backup"
                className="flex items-center justify-center p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/10"
              >
                <Download className="w-5 h-5" />
              </button>
              <label 
                title="Upload Backup"
                className="flex items-center justify-center p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/10 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImport}
                />
              </label>

              <button 
                onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-2xl transition-all font-bold border border-white/10"
              >
                <FolderPlus className="w-5 h-5" />
                Folder
              </button>
              <button 
                onClick={() => { setEditingItem(null); setIsItemModalOpen(true); }}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-cyan-600/20"
              >
                <Plus className="w-5 h-5" />
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
           <div className="space-y-12">
             
             {/* Subfolders Grid */}
             {groups.length > 0 && (
                <section>
                   <h2 className="text-lg font-bold uppercase tracking-widest text-gray-500 mb-6 pl-2">Categories / Folders</h2>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <AnimatePresence>
                         {groups.map((group, index) => (
                            <motion.div
                              key={group.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => navigate(`/tools/media/group/${group.id}`)}
                              className="group cursor-pointer relative bg-gradient-to-br from-black/60 to-[#1c1c1e] border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all flex items-center gap-4 overflow-hidden"
                            >
                               {group.image_url ? (
                                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                                     <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
                                  </div>
                               ) : (
                                  <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center shrink-0">
                                     <FolderOpen size={24} />
                                  </div>
                               )}
                               
                               <div className="min-w-0 flex-1">
                                  <h3 className="font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{group.name}</h3>
                                  <p className="text-xs text-gray-500 truncate">{group.description || 'Category'}</p>
                               </div>

                               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => openGroupEditor(group, e)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                     <span className="sr-only">Edit</span>
                                     <div className="w-1 h-4 border-l border-r border-current opacity-50 mx-auto" />
                                  </button>
                                  <button onClick={(e) => handleDeleteGroup(group.id, e)} className="p-2 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-500 transition-colors">
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
                <div className="flex items-center justify-between mb-6 pl-2">
                   <h2 className="text-lg font-bold uppercase tracking-widest text-gray-500">Media Units</h2>
                   <span className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full">{items.length} Tracked</span>
                </div>
                
                <MediaCards 
                  items={items} 
                  onEdit={openItemEditor} 
                  onDelete={handleDeleteItem} 
                />
             </section>

           </div>
        )}
      </main>

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
