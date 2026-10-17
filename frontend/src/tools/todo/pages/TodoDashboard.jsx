import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Filter,
  ClipboardList,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import todoService from '../services/todoService';

export default function TodoDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'active') params.is_completed = 'false';
      if (filter === 'completed') params.is_completed = 'true';
      const data = await todoService.getItems(params);
      setTasks(data.results || data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      await todoService.createItem(newTask);
      setNewTask({ title: '', priority: 'medium' });
      setIsAdding(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      await todoService.updateItem(task.id, { is_completed: !task.is_completed });
      fetchTasks();
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await todoService.deleteItem(id);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const priorityMeta = {
    low: { color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    medium: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Tool Header */}
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20"
        >
          <ClipboardList className="w-8 h-8 text-black" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white"
        >
          Task <span className="text-amber-500">Sanctuary</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 text-lg"
        >
          Organize your chaos. Master your productivity. Reach your potential.
        </motion.p>
      </header>

      {/* Main Action Area */}
      <section className="mb-10 relative z-20">
        {!isAdding ? (
          <button
            onClick={() => {
              console.log('Diary Overhaul: Opening task entry.');
              setIsAdding(true);
            }}
            className="w-full h-20 glass rounded-3xl border border-black/5 dark:border-white/5 flex items-center px-10 gap-6 text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all shrink-0">
              <Plus className="w-6 h-6 group-hover:text-black" />
            </div>
            <span className="text-xl font-medium">What is your next priority?</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-8 bg-white/80 dark:bg-zinc-950/40 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)]"
          >
            <form onSubmit={handleAddTask}>
              <div className="flex flex-col gap-6">
                <input
                  autoFocus
                  type="text"
                  placeholder="The task at hand..."
                  className="bg-transparent border-none outline-none text-3xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 selection:bg-amber-500/30"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                
                <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4">
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, priority: p })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          newTask.priority === p 
                            ? `${priorityMeta[p].bg} ${priorityMeta[p].color} ${priorityMeta[p].border}`
                            : 'bg-transparent border-white/10 text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-6 py-3 rounded-xl text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!newTask.title.trim()}
                      className="btn-premium btn-primary px-8 h-12 rounded-xl text-xs font-bold"
                    >
                      <Check size={16} /> Create Task
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </section>

      {/* Filters & Count */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-4">
        <div className="flex gap-2 p-1 glass rounded-2xl border border-white/5 scroll-container overflow-x-auto w-full md:w-auto">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 text-zinc-500 whitespace-nowrap">
          <Sparkles size={16} className="text-amber-500/40" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} Recorded
          </span>
        </div>
      </section>

      {/* Task List */}
      <section className="space-y-4 px-1">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center gap-4"
            >
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </motion.div>
          ) : tasks.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 glass rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center text-center px-10"
            >
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8">
                <CheckCircle2 className="w-10 h-10 text-zinc-700" />
              </div>
              <p className="text-zinc-500 text-lg font-medium">All clear. Enjoy your peace of mind.</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 ${
                  task.is_completed 
                    ? 'bg-transparent border-black/5 dark:border-white/5 opacity-50' 
                    : 'card-premium border-black/5 dark:border-white/5 hover:border-amber-500/20'
                }`}
              >
                <button 
                  onClick={() => handleToggleTask(task)}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 ${
                    task.is_completed 
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-amber-500 shadow-inner' 
                      : 'bg-black/5 dark:bg-white/5 text-zinc-600 hover:text-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  {task.is_completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-xl font-bold transition-all duration-500 tracking-tight ${
                    task.is_completed ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-slate-800 dark:text-zinc-200'
                  }`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border ${priorityMeta[task.priority].bg} ${priorityMeta[task.priority].color} ${priorityMeta[task.priority].border}`}>
                      {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl text-zinc-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

