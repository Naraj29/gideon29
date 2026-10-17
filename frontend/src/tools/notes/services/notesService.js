// Demo version using localStorage instead of backend API

const STORAGE_KEY = 'notes_entries';

const getNotesData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveNotesData = (notes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const notesService = {
  getNotes: async (params = {}) => {
    const notes = getNotesData();
    return { results: notes, count: notes.length };
  },
  
  getNote: async (id) => {
    const notes = getNotesData();
    const note = notes.find(n => n.id === id);
    return note || null;
  },

  createNote: async (data) => {
    const notes = getNotesData();
    const newNote = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
    notes.unshift(newNote);
    saveNotesData(notes);
    return newNote;
  },
  
  updateNote: async (id, data) => {
    const notes = getNotesData();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...data };
      saveNotesData(notes);
      return notes[index];
    }
    throw new Error('Note not found');
  },
  
  deleteNote: async (id) => {
    const notes = getNotesData();
    const filtered = notes.filter(n => n.id !== id);
    saveNotesData(filtered);
  }
};

export default notesService;
