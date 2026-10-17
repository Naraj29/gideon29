import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Save, Trash2, Smile } from 'lucide-react';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`diary/entries/${id}/`);
      setEntry({
        title: data.title,
        content: data.content,
        mood: data.mood || '',
        tags: data.tags || []
      });
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entry.content.trim()) return alert("Content cannot be empty");
    
    setSaving(true);
    try {
      if (id) {
        await api.put(`diary/entries/${id}/`, entry);
      } else {
        await api.post('diary/entries/', entry);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;
    try {
      await api.delete(`diary/entries/${id}/`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to delete entry");
    }
  };

  if (loading) return <div className="app-container" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-secondary)' }}>Loading entry...</div>;

  return (
    <div className="app-container slide-up">
      <nav className="nav-bar" style={{ padding: '1rem 0', marginBottom: '1.5rem', borderBottom: 'none' }}>
        <Link to="/dashboard" className="btn secondary" style={{ padding: '0.5rem 1rem', border: 'none' }}>
          <ArrowLeft size={18} /> Back
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {id && (
            <button className="btn danger" onClick={handleDelete} title="Delete memory">
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </nav>

      <div className="glass-panel fade-in stagger-1" style={{ padding: '0', overflow: 'hidden' }}>
        <input 
          type="text" 
          placeholder="Give your memory a title (optional)" 
          value={entry.title}
          onChange={(e) => setEntry({...entry, title: e.target.value})}
          style={{ 
              background: 'transparent', 
              border: 'none', 
              borderBottom: '1px solid var(--glass-border)', 
              borderRadius: '16px 16px 0 0', 
              fontSize: '1.5rem', 
              padding: '1.5rem 2rem', 
              fontWeight: '600' 
          }}
        />
        
        <textarea 
          placeholder="How was your day? Start writing here..."
          value={entry.content}
          onChange={(e) => setEntry({...entry, content: e.target.value})}
          style={{ 
              background: 'transparent', 
              border: 'none', 
              borderRadius: '0', 
              minHeight: '450px', 
              fontSize: '1.1rem', 
              padding: '2rem', 
              lineHeight: '1.8', 
              color: 'rgba(255,255,255,0.92)',
              boxShadow: 'none' // Remove focus box shadow for clean editor
          }}
          autoFocus
        />

        <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem 2rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.15)', borderRadius: '0 0 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Smile size={18} color="var(--text-secondary)" />
            <select 
              value={entry.mood} 
              onChange={(e) => setEntry({...entry, mood: e.target.value})}
              style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', boxShadow: 'none' }}
            >
              <option value="" style={{color: 'black'}}>Mood...</option>
              <option value="Happy" style={{color: 'black'}}>Happy ✨</option>
              <option value="Determined" style={{color: 'black'}}>Determined 🚀</option>
              <option value="Sad" style={{color: 'black'}}>Sad 🌧️</option>
              <option value="Excited" style={{color: 'black'}}>Excited 🎉</option>
              <option value="Anxious" style={{color: 'black'}}>Anxious 😰</option>
              <option value="Calm" style={{color: 'black'}}>Calm 🍃</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
