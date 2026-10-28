import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useEffect, useState } from 'react';

const fallbackProjects = [
  { title: 'Smart Campus Navigation System', domain: 'Web Development', views: 482 },
  { title: 'AI-Based Attendance System', domain: 'Artificial Intelligence', views: 731 },
  { title: 'SecureVault Password Manager', domain: 'Cyber Security', views: 356 },
  { title: 'IoT Smart Irrigation', domain: 'IoT', views: 298 }
];

const domains = [
  ['Web Development', 'Build modern campus experiences', '◫'],
  ['Artificial Intelligence', 'Explore intelligent systems', '✦'],
  ['IoT & Embedded', 'Connect ideas to the real world', '⌁'],
  ['Cyber Security', 'Learn from secure-by-design work', '◈'],
  ['Data & Analytics', 'Turn projects into insights', '◌'],
  ['Mobile Development', 'Discover apps built by students', '▣'],
  ['Cloud & DevOps', 'See how projects reach production', '☁'],
  ['Blockchain', 'Explore decentralized solutions', '◇']
];

export default function Landing() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects')
      .then(r => setProjects(r.data.projects || []))
      .catch(() => {});
  }, []);

  const visibleProjects = (projects.length ? projects : fallbackProjects).slice(0, 4);

  return (
    <div className="landing">
      <Navbar />

      <main>
        <section className="lp-hero">
          <div className="lp-hero-glow lp-glow-one" />
          <div className="lp-hero-glow lp-glow-two" />

          <div className="lp-hero-inner">
            <div className="lp-hero-copy">
              <div className="lp-kicker"><span /> UNIVERSITY PROJECT REPOSITORY · EST. 2026</div>

              <h1>
                Campus Project
                <br />
                <span>Intelligence</span>
                <br />
                Platform
              </h1>

              <p className="lp-hero-text">
                One centralized academic home for discovering, managing and preserving
                student projects — so every batch can build on what came before.
              </p>

              <div className="lp-actions">
                <Link className="lp-btn lp-btn-dark" to="/projects">Explore Projects <span>→</span></Link>
                <Link className="lp-btn lp-btn-white" to="/signup">Create Account</Link>
              </div>

              <div className="lp-stats">
                <div><b>{projects.length || '—'}</b><span>Approved projects</span></div>
                <div><b>{new Set(projects.map(p => p.department)).size || '—'}</b><span>Departments</span></div>
                <div><b>{new Set(projects.map(p => p.domain)).size || '—'}</b><span>Tech domains</span></div>
              </div>
            </div>

            <div className="lp-repo-wrap">
              <div className="lp-repo">
                <div className="lp-repo-head">
                  <div>
                    <strong>Repository at a glance</strong>
                    <small>Live project showcase</small>
                  </div>
                  <span className="lp-live"><i /> LIVE</span>
                </div>

                <div className="lp-repo-list">
                  {visibleProjects.map((p, i) => (
                    <Link to={p._id ? `/projects/${p._id}` : '/projects'} className="lp-project-row" key={p._id || i}>
                      <span className={`lp-project-dot dot-${i}`} />
                      <div>
                        <strong>{p.title}</strong>
                        <small>{p.domain}</small>
                      </div>
                      <em>{p.views || 0} views</em>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="lp-approval">
                <span>✓</span>
                <div><strong>Faculty approved</strong><small>Draft → Pending → Approved</small></div>
              </div>
            </div>
          </div>

          <div className="lp-tech-strip">
            <div className="lp-tech-track">
              {['React', 'Python', 'TensorFlow', 'Flutter', 'MongoDB', 'Node.js', 'ESP32', 'Docker', 'OpenCV', 'Kubernetes', 'MQTT', 'Java'].map((x, i) => (
                <span key={i}><b>◆</b>{x}</span>
              ))}
              {['React', 'Python', 'TensorFlow', 'Flutter', 'MongoDB', 'Node.js', 'ESP32', 'Docker', 'OpenCV', 'Kubernetes', 'MQTT', 'Java'].map((x, i) => (
                <span key={`copy-${i}`}><b>◆</b>{x}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-why" id="features">
          <div className="lp-heading">
            <div className="lp-kicker"><span /> WHY CPIP</div>
            <h2>Everything your projects need,<br />in one academic home.</h2>
            <p>Stop losing valuable project knowledge between batches, drives and scattered documents.</p>
          </div>

          <div className="lp-feature-grid">
            {[
              ['01', 'Centralized Repository', 'Every project is preserved in one structured campus archive instead of scattered folders and forgotten links.', '▤'],
              ['02', 'Easy Discovery', 'Search by title, technology, domain, department or year and find relevant prior work faster.', '⌕'],
              ['03', 'Structured Information', 'Problem statement, objectives, methodology, team, guide and links are captured consistently.', '≡'],
              ['04', 'Department-wise', 'Keep projects organized across departments, academic years and technical domains.', '▦'],
              ['05', 'Technology Search', 'Find projects built with the stack you want to learn from — React, Java, ESP32, Python and more.', '⌘'],
              ['06', 'Intelligence · Soon', 'Phase 2 can add similarity detection, duplicate discovery and research-gap insights on top of this foundation.', '✦']
            ].map(([n, title, text, icon]) => (
              <article className="lp-feature" key={n}>
                <div className="lp-feature-top"><span>{n}</span><b>{icon}</b></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-work">
          <div className="lp-section lp-work-inner">
            <div className="lp-heading lp-heading-center">
              <div className="lp-kicker"><span /> HOW IT WORKS</div>
              <h2>Submit → Organize → Discover → Build Better</h2>
              <p>A simple academic workflow that turns past project work into useful institutional knowledge.</p>
            </div>

            <div className="lp-steps">
              {[
                ['01', 'Submit', 'Students submit project details, documentation, technologies and team information.'],
                ['02', 'Review', 'Faculty reviews submissions while the platform keeps a clear approval trail.'],
                ['03', 'Discover', 'Juniors search approved work by domain, technology, department and year.'],
                ['04', 'Build Better', 'Teams learn from previous work instead of unknowingly repeating it.']
              ].map(([n, title, text], i) => (
                <div className="lp-step" key={n}>
                  <div className="lp-step-number">{n}</div>
                  <div className="lp-step-line" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-domains">
          <div className="lp-domain-head">
            <div>
              <div className="lp-kicker"><span /> EXPLORE BY DOMAIN</div>
              <h2>Multiple domains, one archive.</h2>
            </div>
            <Link to="/projects" className="lp-text-link">Browse all →</Link>
          </div>

          <div className="lp-domain-grid">
            {domains.map(([name, blurb, icon]) => (
              <Link className="lp-domain" to={`/projects?domain=${encodeURIComponent(name)}`} key={name}>
                <span>{icon}</span>
                <strong>{name}</strong>
                <small>{blurb}</small>
                <i>→</i>
              </Link>
            ))}
          </div>
        </section>

        <section className="lp-section lp-cta-section" id="about">
          <div className="lp-cta">
            <div className="lp-cta-copy">
              <div className="lp-cta-kicker">FOR STUDENTS & FACULTY</div>
              <h2>Preserve this year's work<br />for next year's breakthroughs.</h2>
              <p>Create an account, submit your project and contribute to a living campus archive your juniors can actually use.</p>
              <div className="lp-actions">
                <Link to="/signup" className="lp-btn lp-btn-cta">Create account <span>→</span></Link>
                <Link to="/login" className="lp-btn lp-btn-cta-outline">Login</Link>
              </div>
            </div>
            <div className="lp-status-grid">
              {[
                ['Draft', 'Save work in progress'],
                ['Pending', 'Await faculty review'],
                ['Approved', 'Published to archive'],
                ['Bookmarked', 'Saved by juniors']
              ].map(([a, b]) => (
                <div key={a}><strong>{a}</strong><small>{b}</small></div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div><strong>CPIP</strong><span>Campus Project Intelligence Platform</span></div>
        <small>Phase 1 · Academic Project Repository</small>
      </footer>
    </div>
  );
}
