import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get(`/projects/${id}`).then(r => {
      setP(r.data.project);
      setNote(r.data.project.reviewNote || '');
    }).catch(e => setError(e.response?.data?.message || 'Unable to load project.'));
  };

  useEffect(() => { load(); }, [id]);

  const review = async status => {
    setError('');
    setBusy(true);
    try {
      await api.put(`/faculty/projects/${id}/review`, { status, reviewNote: note });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to update the review.');
    } finally {
      setBusy(false);
    }
  };

  if (!p) return <><Navbar/><div className="empty">{error || 'Loading project...'}</div></>;

  return (
    <>
      <Navbar/>
      <main className="content detail">
        <Link to="/projects" className="back">← Back to projects</Link>
        <div className="detail-head">
          <div>
            <span className="eyebrow">{p.domain}</span>
            <h1>{p.title}</h1>
            <p>{p.shortDescription}</p>
          </div>
          <div>
            {p.source === 'DATASET' && <span className="source-badge detail-source">REFERENCE DATA</span>}
            <span className={`status ${p.status.toLowerCase()}`}>{p.status}</span>
          </div>
        </div>

        <div className="detail-grid">
          <section>
            <h3>Project description</h3><p>{p.description}</p>
            <h3>Problem statement</h3><p>{p.problemStatement || 'Not provided.'}</p>
            <h3>Objectives</h3><p>{p.objectives || 'Not provided.'}</p>
            <h3>Methodology</h3><p>{p.methodology || 'Not provided.'}</p>
            {p.reviewNote && <><h3>Faculty feedback</h3><p>{p.reviewNote}</p></>}
            {p.tags?.length > 0 && <><h3>Tags</h3><div className="chips">{p.tags.map(t => <span key={t}>{t}</span>)}</div></>}
          </section>

          <aside>
            <div className="side-card">
              <b>Project details</b>
              <span>Department<strong>{p.department}</strong></span>
              <span>Academic year<strong>{p.academicYear || '—'}</strong></span>
              <span>Project type<strong>{p.projectType}</strong></span>
              <span>Faculty guide<strong>{p.guideId?.name || p.facultyGuide || '—'}</strong></span>
              <span>Submitted by<strong>{p.submittedBy?.name || '—'}</strong></span>
              <span>Student email<strong>{p.submittedBy?.email || '—'}</strong></span>
              <span>Team members<strong>{p.teamMembers?.length ? p.teamMembers.join(', ') : '—'}</strong></span>
              <span>Views<strong>{p.views}</strong></span>
              {p.reviewedBy?.name && <span>Approved by<strong>{p.reviewedBy.name}</strong></span>}
            </div>

            <div className="side-card">
              <b>Technologies</b>
              <div className="chips">{(p.technologies || []).map(t => <span key={t}>{t}</span>)}</div>
            </div>

            {(p.githubUrl || p.demoUrl || p.documentationUrl) && <div className="side-card"><b>Project links</b>{p.githubUrl && <a className="side-link" href={p.githubUrl} target="_blank" rel="noreferrer">GitHub repository →</a>}{p.demoUrl && <a className="side-link" href={p.demoUrl} target="_blank" rel="noreferrer">Live demo →</a>}{p.documentationUrl && <a className="side-link" href={p.documentationUrl} target="_blank" rel="noreferrer">Documentation →</a>}</div>}

            {user?.role === 'FACULTY' && p.status === 'Pending' && String(p.guideId?._id || p.guideId) === String(user._id) && (
              <div className="side-card guide-review-card">
                <b>Guide review</b>
                <p className="review-help">Review all submitted details above before deciding whether to publish this project.</p>
                <textarea className="review-note" rows="5" placeholder="Add feedback for the student..." value={note} onChange={e => setNote(e.target.value)} />
                <div className="detail-review-actions">
                  <button className="btn dark small" disabled={busy} onClick={() => review('Approved')}>{busy ? 'Saving...' : 'Approve & publish'}</button>
                  <button className="btn outline small" disabled={busy} onClick={() => review('Rejected')}>Return to student</button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
