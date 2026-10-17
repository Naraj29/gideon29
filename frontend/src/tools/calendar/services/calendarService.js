// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'calendar_events';

const getEventsData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveEventsData = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

const calendarService = {
  getEvents: async (params = {}) => {
    const events = getEventsData();
    return { results: events, count: events.length };
  },
  
  createEvent: async (data) => {
    const events = getEventsData();
    const newEvent = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    events.unshift(newEvent);
    saveEventsData(events);
    return newEvent;
  },
  
  updateEvent: async (id, data) => {
    const events = getEventsData();
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...data };
      saveEventsData(events);
      return events[index];
    }
    throw new Error('Event not found');
  },
  
  deleteEvent: async (id) => {
    const events = getEventsData();
    const filtered = events.filter(e => e.id !== id);
    saveEventsData(filtered);
  }
};

export default calendarService;
