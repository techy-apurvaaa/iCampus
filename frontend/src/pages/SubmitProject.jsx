import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SubmitProject() {
  const nav = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [error, setError] = useState('');
  const [loadingProject, setLoadingProject] = useState(Boolean(id));
  const [f, setF] = useState({
    title: '', shortDescription: '', description: '', problemStatement: '',
    objectives: '', methodology: '', department: user.department, academicYear: '2025-26',
    domain: 'Web Development', projectType: 'Academic', technologies: 'React, Node.js, MongoDB',
    tags: '', teamMembers: '', guideId: '', githubUrl: '', demoUrl: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const guideResponse = await api.get('/faculty/guides');
        setGuides(guideResponse.data.guides || []);

        if (id) {
          const projectResponse = await api.get(`/projects/${id}`);
          const p = projectResponse.data.project;

          if (p.submittedBy?._id !== user._id || p.status !== 'Rejected') {
            setError('Only your projects returned for changes can be edited here.');
            return;
          }

          setF({
            title: p.title || '',
            shortDescription: p.shortDescription || '',
            description: p.description || '',
            problemStatement: p.problemStatement || '',
            objectives: p.objectives || '',
            methodology: p.methodology || '',
            department: p.department || user.department,
            academicYear: p.academicYear || '',
            domain: p.domain || 'Web Development',
            projectType: p.projectType || 'Academic',
            technologies: (p.technologies || []).join(', '),
            tags: (p.tags || []).join(', '),
            teamMembers: (p.teamMembers || []).join(', '),
            guideId: p.guideId?._id || p.guideId || '',
            githubUrl: p.githubUrl || '',
            demoUrl: p.demoUrl || ''
          });
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Unable to load the project. Please try again.');
      } finally {
        setLoadingProject(false);
      }
    };
    load();
  }, [id, user._id, user.department]);

  const change = e => setF({ ...f, [e.target.name]: e.target.value });

  const save = async action => {
    setError('');
    try {
      if (id) {
        await api.put(`/projects/${id}`, { ...f, action: 'submit' });
      } else {
        await api.post('/projects', { ...f, action });
      }
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save project');
    }
  };

  return (
    <div className="form-page">
      <div className="form-page-head">
        <button className="back-btn" onClick={() => nav('/dashboard')}>← Dashboard</button>
        <span className="kicker">PROJECT SUBMISSION</span>
        <h1>{id ? 'Update & resubmit project' : 'Submit a project'}</h1>
        <p>{id ? 'Your guide returned this project with feedback. Make the requested changes and send it back to the same review workflow.' : 'Your submission goes to the selected faculty guide first. Only an approved project becomes visible in the public repository.'}</p>

        <div className="submission-flow">
          <span className="flow-done">01 · Student submits</span>
          <span>→</span>
          <span className="flow-current">02 · Faculty guide reviews</span>
          <span>→</span>
          <span>03 · Approved → Repository</span>
        </div>
      </div>

      <div className="large-form">
        <div className="form-section">
          <h3>Project information</h3>
          <div className="two">
            <label>Project title<input name="title" value={f.title} onChange={change} placeholder="e.g. Smart Campus Navigation"/></label>
            <label>Short description<input name="shortDescription" value={f.shortDescription} onChange={change} placeholder="One sentence summary"/></label>
          </div>
          <label>Description<textarea name="description" value={f.description} onChange={change} rows="5" placeholder="Describe the project..."/></label>
          <div className="two">
            <label>Problem statement<textarea name="problemStatement" value={f.problemStatement} onChange={change} rows="4"/></label>
            <label>Objectives<textarea name="objectives" value={f.objectives} onChange={change} rows="4"/></label>
          </div>
          <label>Methodology<textarea name="methodology" value={f.methodology} onChange={change} rows="4"/></label>
        </div>

        <div className="form-section">
          <h3>Classification & faculty guide</h3>
          <div className="three">
            <label>Department
              <select name="department" value={f.department} onChange={change}>
                <option>Computer Engineering</option><option>Information Technology</option>
                <option>Electronics</option><option>Mechanical</option><option>Civil Engineering</option>
              </select>
            </label>
            <label>Academic year<input name="academicYear" value={f.academicYear} onChange={change}/></label>
            <label>Domain
              <select name="domain" value={f.domain} onChange={change}>
                <option>Web Development</option><option>AI</option><option>IoT</option>
                <option>Blockchain</option><option>Cloud</option><option>Cybersecurity</option>
                <option>Mobile</option><option>Data Science</option>
              </select>
            </label>
          </div>

          <label className="guide-select">
            Faculty guide
            <select name="guideId" value={f.guideId} onChange={change}>
              <option value="">Select your guide before submitting</option>
              {guides.map(g => (
                <option key={g._id} value={g._id}>
                  {g.name} · {g.department}
                </option>
              ))}
            </select>
            <small>Submit is blocked until an active faculty guide is selected. Drafts may be saved without one.</small>
          </label>

          <div className="two">
            <label>Technologies<input name="technologies" value={f.technologies} onChange={change}/><small>Comma separated</small></label>
            <label>Tags<input name="tags" value={f.tags} onChange={change}/></label>
          </div>
          <div className="two">
            <label>Team members<input name="teamMembers" value={f.teamMembers} onChange={change}/></label>
            <label>Project type<select name="projectType" value={f.projectType} onChange={change}><option>Academic</option><option>Mini Project</option><option>Final Year Project</option><option>Research</option></select></label>
          </div>
        </div>

        <div className="form-section">
          <h3>Project links</h3>
          <div className="two">
            <label>GitHub URL<input name="githubUrl" value={f.githubUrl} onChange={change} placeholder="https://github.com/..."/></label>
            <label>Demo URL<input name="demoUrl" value={f.demoUrl} onChange={change} placeholder="https://..."/></label>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          {!id && <button className="btn outline" onClick={() => save('draft')}>Save draft</button>}
          <button className="btn dark" onClick={() => save('submit')}>{id ? 'Resubmit to guide →' : 'Send to guide for review →'}</button>
        </div>
      </div>
    </div>
  );
}
