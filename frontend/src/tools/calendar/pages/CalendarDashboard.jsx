import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  MapPin, 
  Clock,
  Trash2,
  BookHeart,
  Flag,
  Sparkles,
  ArrowRight,
  ChevronDown,
  HeartPulse,
  Droplet,
  Moon,
  Activity,
  Target,
  Smile,
  Meh,
  Frown,
  CloudLightning
} from 'lucide-react';
import calendarService from '../services/calendarService';
import plannerService from '../../event-planner/services/plannerService';
import unifiedService from '../../../lib/unifiedService';
import { useNavigate } from 'react-router-dom';

export default function CalendarDashboard() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState({ calendar: [], diary: [], projects: [], life_records: [] });
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    description: '', 
    start_time: '', 
    end_time: '', 
    location: '', 
    project: '',
    color: '#3b82f6' 
  });

  useEffect(() => {
    fetchMonthData();
    fetchProjects();
  }, [currentDate]);

  const fetchMonthData = async () => {
    try {
      setLoading(true);
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const data = await unifiedService.getMonthData(start, end);
      setMonthData(data);
    } catch (err) {
      console.error('Failed to fetch month data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await plannerService.getProjects();
      setProjects(data.results || data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleDayClick = async (day) => {
    setSelectedDate(day);
    setIsDayOpen(true);
    try {
      const details = await unifiedService.getDayDetails(format(day, 'yyyy-MM-dd'));
      setDayDetails(details);
    } catch (err) {
      console.error('Failed to fetch day details', err);
    }
  };

  const openAddModal = (e) => {
    e.stopPropagation();
    setNewEvent({
      ...newEvent,
      start_time: format(selectedDate || new Date(), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(selectedDate || new Date(), "yyyy-MM-dd'T'HH:mm"),
      project: ''
    });
    setIsAdding(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await calendarService.createEvent(newEvent);
      setIsAdding(false);
      fetchMonthData();
    } catch (err) {
      console.error('Failed to add event', err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await calendarService.deleteEvent(id);
      setIsDayOpen(false);
      fetchMonthData();
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="min-h-screen bg-transparent text-white pt-6">
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
            <p className="text-gray-400 mt-1">Unified view of your time and achievements.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-medium"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="bg-[#1c1c1e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
          {loading && (
             <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
             </div>
          )}
          <div className="grid grid-cols-7 border-b border-white/5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = monthData.calendar.filter(e => isSameDay(new Date(e.start_time), day));
              const hasDiary = monthData.diary.some(d => isSameDay(new Date(d.entry_date), day));
              const hasProjects = monthData.projects.some(p => isSameDay(new Date(p.event_date), day));
              const lifeRec = monthData.life_records?.find(l => isSameDay(new Date(l.date), day));

              const getMoodIcon = (mood) => {
                switch(mood) {
                  case 'exceptional': return <Smile className="w-4 h-4 text-emerald-400" />;
                  case 'good': return <Smile className="w-4 h-4 text-teal-400" />;
                  case 'neutral': return <Meh className="w-4 h-4 text-zinc-400" />;
                  case 'bad': return <Frown className="w-4 h-4 text-orange-400" />;
                  case 'terrible': return <CloudLightning className="w-4 h-4 text-red-500" />;
                  default: return null;
                }
              };

              return (
                <div 
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[140px] p-2 border-r border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors group relative ${
                    !isSameMonth(day, monthStart) ? 'opacity-30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    
                    <div className="flex gap-1 items-center">
                        {lifeRec && getMoodIcon(lifeRec.mood)}
                        {hasDiary && <BookHeart className="w-4 h-4 text-amber-500/60" />}
                        {hasProjects && <Flag className="w-4 h-4 text-emerald-500/60" />}
                     </div>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div 
                        key={event.id}
                        style={{ backgroundColor: `${event.color}20`, color: event.color, borderColor: `${event.color}40` }}
                        className="text-[10px] px-2 py-1 rounded-md mb-1 border truncate"
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-gray-500 pl-2">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                  
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Day Details Sidepanel */}
      <AnimatePresence>
        {isDayOpen && selectedDate && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsDayOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#1c1c1e] z-[120] border-l border-white/10 shadow-2xl overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">{format(selectedDate, 'EEEE')}</h2>
                  <p className="text-gray-400">{format(selectedDate, 'MMMM d, yyyy')}</p>
                </div>
                <button onClick={() => setIsDayOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 border" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Diary Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-amber-500 font-bold tracking-widest uppercase text-xs">
                    <BookHeart className="w-4 h-4" /> Diary Reflection
                  </div>
                  {dayDetails?.diary ? (
                    <div 
                      onClick={() => navigate(`/tools/diary/entry/${dayDetails.diary.id}`)}
                      className="glass p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all"
                    >
                      <h4 className="font-bold text-white mb-2">{dayDetails.diary.title || 'Untitled Thought'}</h4>
                      <p className="text-zinc-400 text-sm line-clamp-3">{dayDetails.diary.content_preview}</p>
                      <div className="mt-3 text-amber-500 text-[10px] font-bold uppercase flex items-center gap-2">
                         View Full Reflection <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ) : (
                    <button 
                       onClick={() => navigate('/tools/diary/entry')}
                       className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-zinc-600 hover:text-white hover:border-white/10 transition-all text-sm font-medium"
                    >
                      + Record a reflection
                    </button>
                  )}
                </section>

                {/* Calendar Events */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-blue-500 font-bold tracking-widest uppercase text-xs">
                      <Clock className="w-4 h-4" /> Schedule
                    </div>
                    <button onClick={openAddModal} className="p-1 hover:bg-white/5 rounded-lg text-blue-500">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {dayDetails?.calendar?.length > 0 ? dayDetails.calendar.map(event => (
                      <div key={event.id} className="bg-white/5 p-4 rounded-xl border border-white/5 group relative">
                        <div className="flex items-center justify-between mb-1">
                           <h4 className="font-bold text-white">{event.title}</h4>
                           <button onClick={() => handleDeleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all">
                              <Trash2 className="w-3 h-3" />
                           </button>
                        </div>
                        <p className="text-zinc-500 text-xs mb-2">{event.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(event.start_time), 'p')}</span>
                          {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>}
                        </div>
                      </div>
                    )) : (
                      <p className="text-zinc-600 text-sm italic">No events scheduled.</p>
                    )}
                  </div>
                </section>

                 {/* Projects Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-emerald-500 font-bold tracking-widest uppercase text-xs">
                    <Flag className="w-4 h-4" /> Goal Milestones
                  </div>
                  <div className="space-y-3">
                    {dayDetails?.projects?.length > 0 ? dayDetails.projects.map(project => (
                      <div 
                        key={project.id} 
                        onClick={() => navigate(`/tools/planner/project/${project.id}`)}
                        className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 cursor-pointer transition-all"
                      >
                        <h4 className="font-bold text-emerald-400 flex items-center justify-between">
                          {project.name}
                          <ArrowRight className="w-4 h-4" />
                        </h4>
                      </div>
                    )) : (
                      <p className="text-zinc-600 text-sm italic">No project milestones today.</p>
                    )}
                  </div>
                </section>

                {/* Life Tracker Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-teal-500 font-bold tracking-widest uppercase text-xs">
                    <HeartPulse className="w-4 h-4" /> Wellness & Productivity
                  </div>
                  {dayDetails?.life_record ? (
                    <div className="bg-teal-500/5 p-6 rounded-[2rem] border border-teal-500/10 space-y-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold ${
                            dayDetails.life_record.mood === 'exceptional' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                            dayDetails.life_record.mood === 'good' ? 'bg-teal-500/20 border-teal-500/50 text-teal-400' :
                            dayDetails.life_record.mood === 'neutral' ? 'bg-zinc-500/20 border-zinc-500/50 text-zinc-400' :
                            dayDetails.life_record.mood === 'bad' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
                            'bg-red-500/20 border-red-500/50 text-red-500'
                          }`}>
                             {dayDetails.life_record.mood === 'exceptional' || dayDetails.life_record.mood === 'good' ? <Smile size={24} /> :
                              dayDetails.life_record.mood === 'neutral' ? <Meh size={24} /> :
                              <Frown size={24} />}
                          </div>
                          <div>
                             <h4 className="font-bold text-white capitalize">{dayDetails.life_record.mood} Mood</h4>
                             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Self-Reported State</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                             <div className="flex justify-center mb-1 text-indigo-400"><Moon size={16} /></div>
                             <div className="text-lg font-bold font-mono">{dayDetails.life_record.sleep_hours}h</div>
                             <div className="text-[8px] font-bold text-zinc-500 uppercase">Sleep</div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                             <div className="flex justify-center mb-1 text-cyan-400"><Droplet size={16} /></div>
                             <div className="text-lg font-bold font-mono">{dayDetails.life_record.hydration}</div>
                             <div className="text-[8px] font-bold text-zinc-500 uppercase">Water</div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                             <div className="flex justify-center mb-1 text-emerald-400"><Activity size={16} /></div>
                             <div className="text-lg font-bold font-mono">{dayDetails.life_record.exercise_minutes}m</div>
                             <div className="text-[8px] font-bold text-zinc-500 uppercase">Activity</div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                             <div className="flex justify-center mb-1 text-amber-400"><Target size={16} /></div>
                             <div className="text-lg font-bold font-mono">{dayDetails.life_record.productivity_score}/10</div>
                             <div className="text-[8px] font-bold text-zinc-500 uppercase">Focus</div>
                          </div>
                       </div>

                       <button 
                         onClick={() => navigate('/tools/lifetracker')}
                         className="w-full py-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                       >
                         Open Tracker Dashboard
                       </button>
                    </div>
                  ) : (
                    <button 
                       onClick={() => navigate('/tools/lifetracker')}
                       className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-zinc-600 hover:text-white hover:border-white/10 transition-all text-sm font-medium"
                    >
                      + Log your vitals
                    </button>
                  )}
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1c1c1e] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">New Event</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Grand Event Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Start Time</label>
                    <input 
                      required
                      type="datetime-local" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={newEvent.start_time}
                      onChange={e => setNewEvent({...newEvent, start_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">End Time</label>
                    <input 
                      required
                      type="datetime-local" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={newEvent.end_time}
                      onChange={e => setNewEvent({...newEvent, end_time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Add a location"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={newEvent.location}
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Related Project</label>
                  <div className="relative">
                    <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                      value={newEvent.project}
                      onChange={e => setNewEvent({...newEvent, project: e.target.value})}
                    >
                      <option value="" className="bg-[#1c1c1e]">No Project Link</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#1c1c1e]">{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                  <textarea 
                    rows="3"
                    placeholder="Tell more about the event..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all text-gray-400"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    Save Event
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
