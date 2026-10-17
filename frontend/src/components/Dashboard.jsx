import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';;
import { Plus, Search, Calendar, LogOut, BookHeart } from 'lucide-react';

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Adding slight debounce for search
    const delayDebounce = setTimeout(() => {
        fetchEntries();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchEntries = async () => {
    try {
      const { data } = await api.get(`diary/entries/?search=${search}`);
      // Based on pagination, we get data.results
      setEntries(data.results || data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Failed to fetch entries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <div className="app-container slide-up">
      <nav className="nav-bar">
        <Link to="/dashboard" className="nav-brand">
          <BookHeart color="var(--accent-color)" /> My Diary
        </Link>
        <button className="btn secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={16} />
        </button>
      </nav>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }} className="fade-in stagger-1">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search entries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '3rem', borderRadius: '12px' }}
          />
        </div>
        <Link to="/editor" className="btn" style={{ textDecoration: 'none', borderRadius: '12px' }}>
          <Plus size={18} /> New Entry
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading your memories...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }} className="fade-in stagger-2">
          {entries.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>No entries found</h3>
              <p>Start writing your thoughts today to fill this space.</p>
            </div>
          ) : (
            entries.map(entry => (
              <div 
                key={entry.id} 
                className="glass-panel" 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: '1.5rem' }} 
                onClick={() => navigate(`/editor/${entry.id}`)}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {entry.title || 'Untitled Entry'}
                </h3>
                <p style={{ flex: 1, fontSize: '0.95rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', lineHeight: '1.5' }}>
                  {entry.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#71717a' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {entry.entry_date}</span>
                  {entry.mood && (
                    <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)', padding: '4px 10px', borderRadius: '20px', fontWeight: '500' }}>
                        {entry.mood}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
