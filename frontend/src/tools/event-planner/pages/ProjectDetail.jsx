import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  CheckCircle2, 
  Circle,
  DollarSign,
  TrendingDown,
  Layout,
  CalendarDays
} from 'lucide-react';
import plannerService from '../services/plannerService';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', cost: 0 });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await plannerService.getProject(id);
      setProject(data);
    } catch (err) {
      console.error('Failed to fetch project', err);
      navigate('/tools/planner');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await plannerService.createTask({ ...newTask, project: id });
      setIsAddingTask(false);
      setNewTask({ title: '', cost: 0 });
      fetchProject();
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await plannerService.updateTask(task.id, { is_completed: !task.is_completed });
      fetchProject();
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await plannerService.deleteTask(taskId);
      fetchProject();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  if (loading || !project) return <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">Loading project...</div>;

  const totalSpent = project.total_cost || 0;
  const remainingBudget = project.budget - totalSpent;
  const budgetColor = remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="min-h-screen bg-transparent text-white pt-6">
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <header className="mb-12">
          <button 
            onClick={() => navigate('/tools/planner')}
            className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">{project.name}</h1>
              <p className="text-gray-400 max-w-xl text-lg leading-relaxed">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1c1c1e] p-6 rounded-[1.5rem] border border-white/5">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Total Budget
                </div>
                <div className="text-3xl font-bold">${project.budget}</div>
              </div>
              <div className="bg-[#1c1c1e] p-6 rounded-[1.5rem] border border-white/5">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                  <TrendingDown className="w-4 h-4 text-pink-500" />
                  Remaining
                </div>
                <div className={`text-3xl font-bold ${budgetColor}`}>${remainingBudget}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Task Management */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Planned Tasks</h2>
              <button 
                onClick={() => setIsAddingTask(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {isAddingTask && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-6 mb-8 overflow-hidden"
                >
                  <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-4">
                    <input 
                      required
                      autoFocus
                      type="text" 
                      placeholder="e.g., Book catering service"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-rose-500"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4">
                      <span className="text-gray-500">$</span>
                      <input 
                        type="number" 
                        placeholder="Cost"
                        className="bg-transparent border-none w-24 text-white outline-none focus:ring-0"
                        value={newTask.cost}
                        onChange={e => setNewTask({...newTask, cost: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingTask(false)}
                        className="p-3 text-gray-500 hover:text-white"
                      >
                         <X className="w-6 h-6" />
                      </button>
                      <button 
                        type="submit" 
                        className="bg-rose-500 px-6 py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {project.tasks.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-gray-600">
                  No tasks added yet. Plan your moves.
                </div>
              ) : (
                project.tasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                      task.is_completed ? 'bg-transparent border-white/5 grayscale' : 'bg-[#1c1c1e] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <button 
                      onClick={() => handleToggleTask(task)}
                      className={`transition-colors ${task.is_completed ? 'text-rose-500' : 'text-gray-700 hover:text-gray-500'}`}
                    >
                      {task.is_completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium ${task.is_completed ? 'text-gray-600 line-through' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      {task.cost > 0 && (
                        <span className="text-xs font-bold text-gray-500 uppercase">Estimated Cost: ${task.cost}</span>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 rounded-[2rem] shadow-xl shadow-rose-500/10">
              <h3 className="text-xl font-bold text-white mb-2">Planning Mastery</h3>
              <p className="text-white/70 text-sm mb-6">Complete your tasks to achieve planning perfection.</p>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000"
                  style={{ width: `${(project.tasks.filter(t => t.is_completed).length / (project.tasks.length || 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs font-bold text-white/80">
                <span>PROGRESS</span>
                <span>{Math.round((project.tasks.filter(t => t.is_completed).length / (project.tasks.length || 1)) * 100)}%</span>
              </div>
            </div>

            <div className="bg-[#1c1c1e] border border-white/5 p-8 rounded-[2rem]">
              <h3 className="text-lg font-bold mb-4">Project Date</h3>
              <div className="flex items-center gap-3 text-gray-400">
                <CalendarDays className="w-5 h-5 text-rose-500" />
                {project.event_date ? new Date(project.event_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No date set'}
              </div>
            </div>

            {/* Project Timeline */}
            <div className="bg-[#1c1c1e] border border-white/5 p-8 rounded-[2rem]">
               <div className="flex items-center gap-2 mb-6 text-blue-500 font-bold tracking-widest uppercase text-xs">
                  <Clock className="w-4 h-4" /> Timeline Events
               </div>
               <div className="space-y-4">
                  {project.calendar_events?.length > 0 ? project.calendar_events.map(event => (
                     <div 
                        key={event.id} 
                        className="p-4 bg-white/2 rounded-2xl border border-white/5 text-xs"
                     >
                        <h4 className="font-bold text-white mb-1 truncate">{event.title}</h4>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                           <CalendarIcon className="w-3 h-3" />
                           {new Date(event.start_time).toLocaleDateString()}
                        </div>
                     </div>
                  )) : (
                     <p className="text-zinc-600 text-sm italic">No events linked to this project.</p>
                  )}
               </div>
            </div>

            {/* Linked Chronicles */}
            <div className="bg-[#1c1c1e] border border-white/5 p-8 rounded-[2rem]">
               <div className="flex items-center gap-2 mb-6 text-amber-500 font-bold tracking-widest uppercase text-xs">
                  <BookHeart className="w-4 h-4" /> Linked Chronicles
               </div>
               <div className="space-y-4">
                  {project.diary_entries?.length > 0 ? project.diary_entries.map(entry => (
                     <div 
                        key={entry.id} 
                        onClick={() => navigate(`/tools/diary/entry/${entry.id}`)}
                        className="p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group"
                     >
                        <h4 className="font-bold text-white text-sm mb-1 group-hover:text-amber-500 transition-colors truncate">{entry.title || 'Untitled reflection'}</h4>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold">{new Date(entry.entry_date).toLocaleDateString()}</p>
                     </div>
                  )) : (
                     <p className="text-zinc-600 text-sm italic">No reflections linked to this project yet.</p>
                  )}
                  <button 
                     onClick={() => navigate('/tools/diary/entry')}
                     className="w-full py-4 border border-dashed border-white/5 rounded-2xl text-zinc-600 hover:text-amber-500 hover:border-amber-500/20 transition-all text-xs font-bold"
                  >
                     + New Project Reflection
                  </button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
