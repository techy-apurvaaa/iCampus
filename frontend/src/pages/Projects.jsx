import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [domain, setDomain] = useState(searchParams.get('domain') || 'All');
  const [department, setDepartment] = useState(searchParams.get('department') || 'All');

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get('/projects', { params: { search, domain, department } })
        .then(r => setProjects(r.data.projects || []))
        .catch(() => setProjects([]));
      const next = {};
      if (search) next.search = search;
      if (domain !== 'All') next.domain = domain;
      if (department !== 'All') next.department = department;
      setSearchParams(next, { replace: true });
    }, 180);
    return () => clearTimeout(timer);
  }, [search, domain, department, setSearchParams]);

  return (
    <>
      <Navbar/>
      <main className="content">
        <div className="page-head">
          <div>
            <span className="kicker">THE LIVING ARCHIVE</span>
            <h1>Explore projects</h1>
            <p>Discover faculty-approved work from across the campus repository.</p>
          </div>
          <input className="search" placeholder="Search title, technology..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        <div className="repo-filters">
          <select value={domain} onChange={e => setDomain(e.target.value)}>
            <option value="All">All domains</option>
            <option>Web Development</option><option>AI</option><option>IoT</option>
            <option>Blockchain</option><option>Cloud</option><option>Cybersecurity</option>
            <option>Mobile</option><option>Data Science</option>
          </select>
          <select value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="All">All departments</option>
            <option>Computer Engineering</option><option>Information Technology</option>
            <option>Electronics</option><option>Mechanical</option><option>Civil Engineering</option>
          </select>
          <span className="approved-only">✓ Approved projects only</span>
        </div>

        <div className="project-grid">{projects.map(p => <ProjectCard key={p._id} project={p}/>)}</div>
        {!projects.length && <div className="empty">No approved projects match your filters.</div>}
      </main>
    </>
  );
}
