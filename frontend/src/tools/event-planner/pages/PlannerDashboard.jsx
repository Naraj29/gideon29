import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Layout, 
  Settings, 
  X, 
  ChevronRight,
  Calculator,
  CalendarDays
} from 'lucide-react';
import plannerService from '../services/plannerService';

export default function PlannerDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', budget: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await plannerService.getProjects();
      setProjects(data.results || data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await plannerService.createProject(newProject);
      setIsAdding(false);
      setNewProject({ name: '', description: '', budget: 0 });
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await plannerService.deleteProject(id);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Event Planning</h1>
            <p className="text-gray-400 mt-2">Architecting unforgettable moments.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </header>

        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem]">
            <Layout className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-400">Empty Architect's Desk</h3>
            <p className="text-gray-600 mt-2">Start your first event planning project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/tools/planner/project/${project.id}`)}
                className="group relative bg-[#1c1c1e] border border-white/5 rounded-[2rem] p-8 cursor-pointer overflow-hidden transition-all hover:border-white/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[80px] group-hover:bg-rose-500/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold group-hover:text-rose-400 transition-colors">{project.name}</h2>
                  <button 
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-2 text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-500 mb-8 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap gap-4 mt-auto">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-xs font-bold text-gray-400">
                    <Calculator className="w-4 h-4 text-rose-500" />
                    Budget: ${project.budget}
                  </div>
                  {project.event_date && (
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-xs font-bold text-gray-400">
                      <CalendarDays className="w-4 h-4 text-pink-500" />
                      {new Date(project.event_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="absolute right-8 bottom-8 p-3 bg-white/5 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-all transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto p-10 shadow-2xl shadow-black/50"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">New Project</h2>
                <button onClick={() => setIsAdding(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Project Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Grand Wedding 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    value={newProject.name}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Planned Budget ($)</label>
                  <input 
                    type="number" 
                    placeholder="15000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    value={newProject.budget}
                    onChange={e => setNewProject({...newProject, budget: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Event Date (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    value={newProject.event_date || ''}
                    onChange={e => setNewProject({...newProject, event_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2 ml-1">Brief Description</label>
                  <textarea 
                    rows="3"
                    placeholder="What's this event about?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all text-gray-500"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 font-bold transition-all shadow-lg shadow-rose-600/30"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
