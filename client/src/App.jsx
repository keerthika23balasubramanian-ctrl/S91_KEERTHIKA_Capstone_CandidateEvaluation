import './App.css'

const metrics = [
  { value: '3.5k+', label: 'Applications reviewed' },
  { value: '92%', label: 'Faster shortlisting' },
  { value: '4.8/5', label: 'Recruiter satisfaction' },
]

const features = [
  'Structured candidate scoring',
  'Centralized recruiter dashboard',
  'Shortlist and compare applicants',
  'Transparent evaluation feedback',
]

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">E</span>
          EvalHire
        </div>
        <nav className="nav">
          <a href="#overview">Overview</a>
          <a href="#features">Features</a>
          <a href="#results">Results</a>
        </nav>
        <button className="primary-btn" type="button">
          Get started
        </button>
      </header>

      <main>
        <section className="hero" id="overview">
          <div className="hero-copy">
            <p className="eyebrow">Candidate Evaluation Platform</p>
            <h1>Smarter hiring starts with better candidate insights.</h1>
            <p className="subtitle">
              Help recruitment teams review applications faster, score candidates
              consistently, and shorten the path from applicant to shortlist.
            </p>
            <div className="cta-row">
              <button className="primary-btn" type="button">
                View dashboard
              </button>
              <button className="secondary-btn" type="button">
                Explore workflow
              </button>
            </div>
          </div>

          <div className="hero-panel" aria-label="Candidate summary panel">
            <div className="panel-card panel-header">
              <span className="status-dot" />
              Hiring pipeline
            </div>
            <div className="panel-card stats-card">
              <div>
                <strong>148</strong>
                <span>Open applicants</span>
              </div>
              <div>
                <strong>24</strong>
                <span>Shortlisted</span>
              </div>
            </div>
            <div className="panel-card list-card">
              <div className="list-row">
                <span className="candidate-name">Aisha M.</span>
                <span className="tag strong-tag">Strong fit</span>
              </div>
              <div className="list-row">
                <span className="candidate-name">Daniel R.</span>
                <span className="tag">Under review</span>
              </div>
              <div className="list-row">
                <span className="candidate-name">Nia K.</span>
                <span className="tag">Interview</span>
              </div>
            </div>
          </div>
        </section>

        <section className="metrics" id="results" aria-label="Platform metrics">
          {metrics.map(({ value, label }) => (
            <div className="metric-box" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="feature-section" id="features">
          <div className="section-heading">
            <p className="eyebrow">What this platform does</p>
            <h2>Designed for efficient candidate screening.</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature}>
                <div className="feature-icon">✓</div>
                <p>{feature}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
