import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-card">
      <div className="dot"/>
      {project.source === 'DATASET' && <span className="source-badge">REFERENCE DATA</span>}
      <div className="project-card-body">
        <span className="eyebrow">{project.domain || 'Project'}</span>
        <h3>{project.title}</h3>
        <p>{project.shortDescription || project.description}</p>
        <div className="chips">{(project.technologies || []).slice(0,3).map(t => <span key={t}>{t}</span>)}</div>
      </div>
      <span className="views">{project.views || 0} views</span>
    </Link>
  );
}
