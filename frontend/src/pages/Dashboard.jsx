import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Stat({ n, l, hint }) {
  return <div className="dash-stat"><b>{n}</b><span>{l}</span>{hint && <small>{hint}</small>}</div>;
}

function Bars({ title, items = [] }) {
  const max = Math.max(...items.map(x => x.count), 1);
  return (
    <section className="dash-chart">
      <div className="chart-head"><h3>{title}</h3><span>Approved repository</span></div>
      {items.length ? items.map(x => (
        <div className="bar-row" key={x._id || x.label}>
          <div><span>{x._id || x.label || 'Unclassified'}</span><b>{x.count}</b></div>
          <i><em style={{ width: `${Math.max(5, (x.count / max) * 100)}%` }} /></i>
        </div>
      )) : <div className="chart-empty">No approved data yet.</div>}
    </section>
  );
}

function ReviewStatus({ projects }) {
  const statusText = {
    Draft: 'Draft saved — not submitted for review',
    Pending: 'Submitted — waiting for your guide to review',
    Approved: 'Approved — published in the repository',
    Rejected: 'Changes requested — update and resubmit'
  };

  return (
    <section className="dash-section student-review-section">
      <div className="section-bar">
        <div>
          <h2>Review status</h2>
          <small className="section-subtitle">Track what is happening with each submission.</small>
        </div>
        <Link to="/dashboard/submit">＋ New project</Link>
      </div>

      <div className="student-review-list">
        {projects.map(p => (
          <div className="student-review-card" key={p._id}>
            <div className="student-review-main">
              <div>
                <b>{p.title}</b>
                <small>{p.domain || 'Unclassified'} · {p.department}</small>
              </div>
              <span className={`status ${String(p.status || '').toLowerCase()}`}>{p.status}</span>
            </div>
            <div className="student-review-meta">
              <span><strong>Guide</strong>{p.guideId?.name || p.facultyGuide || 'Not selected'}</span>
              <span><strong>Submitted</strong>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</span>
              {p.reviewedAt && <span><strong>Reviewed</strong>{new Date(p.reviewedAt).toLocaleDateString()}</span>}
            </div>
            <p className="student-status-message">{statusText[p.status] || 'Submission status available here.'}</p>
            {p.reviewNote && (
              <div className="review-feedback">
                <strong>Guide feedback</strong>
                <p>{p.reviewNote}</p>
              </div>
            )}
            {p.status === 'Rejected' && (
              <div className="review-return">
                <span>Update the project using your guide's feedback, then send it back for review.</span>
                <Link className="btn dark small" to={`/dashboard/submit/${p._id}`}>Edit & resubmit →</Link>
              </div>
            )}
          </div>
        ))}
        {!projects.length && <div className="empty">You have not submitted any projects yet.</div>}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [facultyStats, setFacultyStats] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const params = user.role === 'STUDENT'
      ? { mine: true }
      : { status: 'Approved' };

    (user.role === 'STUDENT' ? api.get('/projects/mine') : api.get('/projects', { params }))
      .then(r => { setProjects(r.data.projects || []); setLoadError(''); })
      .catch(e => {
        console.error('Failed to load projects:', e.response?.status, e.response?.data);
        setProjects([]);
        setLoadError(e.response?.data?.message || `Could not load your projects (${e.response?.status || 'network error'})`);
      });

    if (user.role === 'ADMIN') {
      api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => {});
    }
    if (user.role === 'FACULTY') {
      api.get('/faculty/stats').then(r => setFacultyStats(r.data.stats)).catch(() => {});
    }
  }, [user]);

  const studentCounts = useMemo(() => ({
    approved: projects.filter(p => p.status === 'Approved').length,
    pending: projects.filter(p => p.status === 'Pending').length,
    rejected: projects.filter(p => p.status === 'Rejected').length
  }), [projects]);

  const title = user.role === 'ADMIN'
    ? 'Institution dashboard'
    : user.role === 'FACULTY'
      ? 'Guide workspace'
      : `Good to see you, ${user.name.split(' ')[0]}.`;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="side-logo"><span className="logo-mark">⌂</span><b>CPIP</b></div>
        <div className="side-user">
          <div className="avatar">{user.name[0]}</div><b>{user.name}</b><small>{user.role}</small>
        </div>
        <nav className="side-nav">
          <Link className="active" to="/dashboard">⌂ Dashboard</Link>
          <Link to="/projects">▣ Explore Projects</Link>
          {user.role !== 'ADMIN' && <Link to="/dashboard/submit">＋ Submit Project</Link>}
          {user.role === 'FACULTY' && <Link to="/dashboard/review">✓ Review Projects</Link>}
          {user.role === 'ADMIN' && <Link to="/dashboard/users">♙ Manage Users</Link>}
        </nav>
        <button className="logout" onClick={() => { logout(); nav('/'); }}>↪ Sign out</button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <span className="kicker">{user.role} WORKSPACE</span>
            <h1>{title}</h1>
            <p>
              {user.role === 'ADMIN'
                ? 'Monitor the institutional repository and project trends.'
                : user.role === 'FACULTY'
                  ? 'Review projects assigned to you and track your guide workload.'
                  : 'Manage your submissions, follow review progress and discover approved campus work.'}
            </p>
          </div>
          {user.role !== 'ADMIN' && <Link className="btn dark" to="/dashboard/submit">＋ New project</Link>}
        </div>

        {loadError && <div className="error">{loadError}</div>}

        {user.role === 'ADMIN' && stats && (
          <>
            <div className="dash-stats">
              <Stat n={stats.projects} l="Total repository projects" hint={`${stats.campusProjects} campus · ${stats.datasetProjects} dataset`} />
              <Stat n={stats.approved} l="Approved & visible" hint={`${stats.departments} departments`} />
              <Stat n={stats.users} l="Campus accounts" hint={`${stats.domains} active domains`} />
              <Stat n={stats.datasetProjects} l="Reference projects" hint="Open dataset records" />
            </div>

            <div className="chart-grid">
              <Bars title="Projects by domain" items={stats.domainCounts} />
              <Bars title="Top technologies" items={stats.technologyCounts} />
            </div>

            <div className="chart-grid">
              <Bars title="Projects by academic year" items={stats.yearCounts} />
              <section className="dash-chart source-chart">
                <div className="chart-head"><h3>Repository composition</h3><span>Data provenance</span></div>
                <div className="source-stat"><b>{stats.campusProjects}</b><span>Campus submissions</span></div>
                <div className="source-stat"><b>{stats.datasetProjects}</b><span>Public reference dataset</span></div>
                <p>Reference records support analytics and remain separate from the student submission workflow.</p>
              </section>
            </div>
          </>
        )}

        {user.role === 'FACULTY' && facultyStats && (
          <>
            <div className="dash-stats">
              <Stat n={facultyStats.assigned} l="Assigned projects" />
              <Stat n={facultyStats.pending} l="Waiting for review" hint="Your queue" />
              <Stat n={facultyStats.approved} l="Approved by you" />
              <Stat n={facultyStats.rejected} l="Returned for changes" />
            </div>
            <div className="dashboard-banner">
              <div><strong>Your approval is the publishing gate.</strong><span>Students can submit, but their project remains private until you approve it.</span></div>
              <Link className="btn dark small" to="/dashboard/review">Review assigned projects →</Link>
            </div>
          </>
        )}

        {user.role === 'STUDENT' && (
          <>
            <div className="dash-stats">
              <Stat n={projects.length} l="My projects" />
              <Stat n={studentCounts.approved} l="Approved" />
              <Stat n={studentCounts.pending} l="Pending review" />
              <Stat n={studentCounts.rejected} l="Needs changes" />
            </div>
            <ReviewStatus projects={projects} />
          </>
        )}

        {user.role !== 'STUDENT' && (
          <section className="dash-section">
            <div className="section-bar">
              <h2>{user.role === 'ADMIN' ? 'Recent repository projects' : 'Recent approved projects'}</h2>
              <Link to="/projects">View repository →</Link>
            </div>
            <div className="dash-list">
              {projects.slice(0, 8).map(p => (
                <div className="dash-project" key={p._id}>
                  <div>
                    <span className="dot"/>
                    <div><b>{p.title}</b><small>{p.domain} · {p.department}</small></div>
                  </div>
                  {user.role === 'FACULTY' && <Link className="btn outline small" to={`/projects/${p._id}`}>View →</Link>}
                </div>
              ))}
              {!projects.length && <div className="empty">No approved projects yet.</div>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
