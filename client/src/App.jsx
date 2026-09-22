import { useMemo, useState } from 'react'
import './App.css'

const initialCandidates = [
  { id: 1, name: 'Aisha Mehta', role: 'Frontend Developer', score: 92, stage: 'Strong fit', tone: 'fit' },
  { id: 2, name: 'Daniel Ross', role: 'Product Analyst', score: 81, stage: 'Under review', tone: 'neutral' },
  { id: 3, name: 'Nia Kumar', role: 'UI/UX Designer', score: 89, stage: 'Interview', tone: 'interview' },
  { id: 4, name: 'Leo Martin', role: 'Full Stack Engineer', score: 76, stage: 'Waiting', tone: 'pending' },
]

const stageToneMap = {
  'Strong fit': 'fit',
  'Under review': 'neutral',
  Interview: 'interview',
  Waiting: 'pending',
}

const initialTasks = [
  { id: 1, text: 'Review technical assessment', due: 'Today', done: false },
  { id: 2, text: 'Share recruiter feedback', due: 'Tomorrow', done: true },
  { id: 3, text: 'Schedule final interviews', due: 'Friday', done: false },
]

const navItems = ['Dashboard', 'Candidates', 'Interviews', 'Reports', 'Settings']

const hiringFlow = [
  { label: 'Applied', value: '124' },
  { label: 'Screened', value: '94' },
  { label: 'Interview', value: '18' },
  { label: 'Offer', value: '6' },
]

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [candidates, setCandidates] = useState(initialCandidates)
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialCandidates[0].id)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyShortlisted, setShowOnlyShortlisted] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const query = searchTerm.toLowerCase()
      const matchesQuery = candidate.name.toLowerCase().includes(query) || candidate.role.toLowerCase().includes(query)
      const shortlistedOnly = showOnlyShortlisted ? candidate.tone === 'fit' : true
      return matchesQuery && shortlistedOnly
    })
  }, [candidates, searchTerm, showOnlyShortlisted])

  const selectedCandidate =
    filteredCandidates.find((candidate) => candidate.id === selectedCandidateId) ??
    candidates.find((candidate) => candidate.id === selectedCandidateId) ??
    candidates[0]

  const stats = [
    { label: 'Applicants', value: String(candidates.length + 120), change: '+12%' },
    { label: 'Shortlisted', value: String(candidates.filter((candidate) => candidate.tone === 'fit').length + 10), change: '+7%' },
    { label: 'Interviews', value: String(candidates.filter((candidate) => candidate.tone === 'interview').length + 4), change: '+3%' },
    { label: 'Avg. score', value: `${Math.round(candidates.reduce((sum, candidate) => sum + candidate.score, 0) / candidates.length)}%`, change: '+5%' },
  ]

  const completedTasks = tasks.filter((task) => task.done).length
  const progressPercent = Math.round((completedTasks / tasks.length) * 100)

  const addCandidate = () => {
    const names = ['Priya Shah', 'Marcus Lee', 'Samira Khan', 'Owen Clark', 'Emma Stone']
    const roles = ['Backend Developer', 'Data Analyst', 'Product Manager', 'QA Engineer', 'Recruitment Specialist']
    const stages = [
      { label: 'Strong fit', tone: 'fit' },
      { label: 'Under review', tone: 'neutral' },
      { label: 'Interview', tone: 'interview' },
      { label: 'Waiting', tone: 'pending' },
    ]

    const randomStage = stages[Math.floor(Math.random() * stages.length)]
    const newCandidate = {
      id: Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      score: 70 + Math.floor(Math.random() * 25),
      stage: randomStage.label,
      tone: randomStage.tone,
    }

    setCandidates((current) => [newCandidate, ...current])
    setSelectedCandidateId(newCandidate.id)
    setActiveNav('Candidates')
  }

  const toggleTask = (taskId) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task,
      ),
    )
  }

  const exportReport = () => {
    const data = { generatedAt: new Date().toISOString(), candidates, tasks, activeNav }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'evalhire-report.json'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidateId(candidateId)
    setActiveNav('Candidates')
  }

  const startEditingCandidate = (candidate) => {
    setEditingCandidate({ ...candidate })
  }

  const handleEditInputChange = (event) => {
    const { name, value } = event.target
    setEditingCandidate((current) => ({
      ...current,
      [name]: name === 'score' ? Number(value) : value,
      tone: name === 'stage' ? stageToneMap[value] ?? 'neutral' : current?.tone,
    }))
  }

  const saveCandidateChanges = () => {
    if (!editingCandidate) return

    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === editingCandidate.id
          ? {
              ...candidate,
              ...editingCandidate,
              tone: stageToneMap[editingCandidate.stage] ?? candidate.tone,
            }
          : candidate,
      ),
    )

    setSelectedCandidateId(editingCandidate.id)
    setEditingCandidate(null)
  }

  const deleteCandidate = (candidateId) => {
    const remainingCandidates = candidates.filter((candidate) => candidate.id !== candidateId)
    setCandidates(remainingCandidates)

    if (selectedCandidateId === candidateId) {
      setSelectedCandidateId(remainingCandidates[0]?.id ?? null)
    }

    if (editingCandidate?.id === candidateId) {
      setEditingCandidate(null)
    }
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">E</div>
          <div>
            <p className="brand-title">EvalHire</p>
            <span>Recruitment Suite</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`nav-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mini-card">
          <p className="mini-label">Hiring status</p>
          <strong>{progressPercent}%</strong>
          <span>Pipeline completion</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Candidate Evaluation Platform</p>
            <h1>Recruiter Dashboard</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-btn" type="button" onClick={exportReport}>
              Export
            </button>
            <button className="primary-btn" type="button" onClick={addCandidate}>
              Add candidate
            </button>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-copy">
            <p className="hero-tag">This week</p>
            <h2>Hiring is moving faster with fewer manual steps.</h2>
            <p>
              Recruiters can review applications, compare scores, and move top candidates
              to the next stage without the usual spreadsheet chaos.
            </p>
            <div className="hero-actions">
              <button
                className="primary-btn"
                type="button"
                onClick={() => handleSelectCandidate(selectedCandidate.id)}
              >
                Review candidates
              </button>
              <button className="secondary-btn" type="button" onClick={addCandidate}>
                Add new profile
              </button>
            </div>
          </div>

          <div className="hero-graph">
            {hiringFlow.map((step) => (
              <div className="flow-step" key={step.label}>
                <span>{step.label}</span>
                <strong>{step.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((item) => (
            <article className="stat-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <em>{item.change}</em>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel candidates-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Active candidates</p>
                <h2>Shortlist overview</h2>
              </div>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => setShowOnlyShortlisted((current) => !current)}
              >
                {showOnlyShortlisted ? 'Show all' : 'Shortlisted only'}
              </button>
            </div>

            <div className="filter-bar">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search candidate or role"
                className="search-input"
              />
            </div>

            <div className="candidate-list">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <button
                    type="button"
                    className={`candidate-row ${selectedCandidate.id === candidate.id ? 'selected' : ''}`}
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(candidate.id)}
                  >
                    <div className="candidate-meta">
                      <div className="avatar">{candidate.name.charAt(0)}</div>
                      <div>
                        <strong>{candidate.name}</strong>
                        <span>{candidate.role}</span>
                      </div>
                    </div>

                    <div className="score-block">
                      <span>Score</span>
                      <strong>{candidate.score}</strong>
                    </div>

                    <span className={`status-pill ${candidate.tone}`}>{candidate.stage}</span>
                  </button>
                ))
              ) : (
                <div className="empty-state">No candidates match your search.</div>
              )}
            </div>
          </div>

          <div className="panel side-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Priority tasks</p>
                <h2>Today’s actions</h2>
              </div>
            </div>

            <div className="candidate-detail">
              <div className="detail-top">
                <div className="avatar large">{selectedCandidate.name.charAt(0)}</div>
                <div>
                  <strong>{selectedCandidate.name}</strong>
                  <span>{selectedCandidate.role}</span>
                </div>
              </div>
              <div className="detail-grid">
                <div>
                  <label>Current stage</label>
                  <p>{selectedCandidate.stage}</p>
                </div>
                <div>
                  <label>Score</label>
                  <p>{selectedCandidate.score}/100</p>
                </div>
              </div>

              <div className="detail-actions">
                <button className="secondary-btn" type="button" onClick={() => startEditingCandidate(selectedCandidate)}>
                  Update
                </button>
                <button className="danger-btn" type="button" onClick={() => deleteCandidate(selectedCandidate.id)}>
                  Delete
                </button>
              </div>
            </div>

            {editingCandidate && (
              <div className="update-form">
                <h3>Edit candidate</h3>
                <label>
                  Name
                  <input
                    type="text"
                    name="name"
                    value={editingCandidate.name}
                    onChange={handleEditInputChange}
                    className="input-field"
                  />
                </label>
                <label>
                  Role
                  <input
                    type="text"
                    name="role"
                    value={editingCandidate.role}
                    onChange={handleEditInputChange}
                    className="input-field"
                  />
                </label>
                <label>
                  Stage
                  <select name="stage" value={editingCandidate.stage} onChange={handleEditInputChange} className="input-field">
                    <option value="Strong fit">Strong fit</option>
                    <option value="Under review">Under review</option>
                    <option value="Interview">Interview</option>
                    <option value="Waiting">Waiting</option>
                  </select>
                </label>
                <label>
                  Score
                  <input
                    type="number"
                    name="score"
                    min="0"
                    max="100"
                    value={editingCandidate.score}
                    onChange={handleEditInputChange}
                    className="input-field"
                  />
                </label>
                <div className="form-actions">
                  <button className="primary-btn" type="button" onClick={saveCandidateChanges}>
                    Save changes
                  </button>
                  <button className="ghost-btn" type="button" onClick={() => setEditingCandidate(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="task-list">
              {tasks.map((task) => (
                <button
                  type="button"
                  className={`task-item ${task.done ? 'done' : ''}`}
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`task-dot ${task.done ? 'done-dot' : ''}`} />
                  <div>
                    <strong>{task.text}</strong>
                    <span>{task.due}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="progress-card">
              <div className="progress-head">
                <span>Evaluation progress</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className="progress-bar">
                <span className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
