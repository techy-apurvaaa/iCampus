import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Review() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const r = await api.get('/faculty/review-queue');
      setItems(r.data.projects || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load your review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    setError('');
    if (status === 'Rejected' && !(notes[id] || '').trim()) {
      setError('Please add feedback explaining the changes required before returning this project.');
      return;
    }
    setBusyId(id);
    try {
      await api.put(`/faculty/projects/${id}/review`, {
        status,
        reviewNote: notes[id] || ''
      });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to update the project review.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="side-logo"><span className="logo-mark">⌂</span><b>CPIP</b></div>
        <div className="side-user">
          <div className="avatar">{user?.name?.[0]}</div>
          <b>{user?.name}</b>
          <small>FACULTY GUIDE</small>
        </div>
        <nav className="side-nav">
          <Link to="/dashboard">⌂ Dashboard</Link>
          <Link className="active" to="/dashboard/review">✓ Review Projects</Link>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <span className="kicker">FACULTY APPROVAL GATE</span>
            <h1>Projects awaiting review</h1>
            <p>Only projects assigned to you appear here. Approving a project publishes it to the repository.</p>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="empty">Loading your review queue...</div>
        ) : (
          <div className="review-list">
            {items.map(p => (
              <div className="review-card" key={p._id}>
                <div className="review-main">
                  <span className="eyebrow">{p.domain} · {p.academicYear}</span>
                  <h3>{p.title}</h3>
                  <p>{p.shortDescription || p.description}</p>
                  <small>
                    Submitted by {p.submittedBy?.name || 'Student'} · {p.department}
                    {p.guideId?.name ? ` · Guide: ${p.guideId.name}` : ''}
                  </small>
                  <Link className="review-open-link" to={`/projects/${p._id}`}>Open full project details →</Link>
                  <div className="chips review-tech">
                    {(p.technologies || []).slice(0, 6).map(t => <span key={t}>{t}</span>)}
                  </div>
                  <textarea
                    className="review-note"
                    rows="2"
                    placeholder="Optional feedback for the student..."
                    value={notes[p._id] || ''}
                    onChange={e => setNotes({ ...notes, [p._id]: e.target.value })}
                  />
                </div>
                <div className="review-actions">
                  <button
                    className="btn dark small"
                    disabled={busyId === p._id}
                    onClick={() => review(p._id, 'Approved')}
                  >
                    {busyId === p._id ? 'Saving...' : 'Approve & publish'}
                  </button>
                  <button
                    className="btn outline small"
                    disabled={busyId === p._id}
                    onClick={() => review(p._id, 'Rejected')}
                  >
                    Return to student
                  </button>
                </div>
              </div>
            ))}
            {!items.length && <div className="empty">Review queue is clear. New student submissions will appear here.</div>}
          </div>
        )}
      </main>
    </div>
  );
}
