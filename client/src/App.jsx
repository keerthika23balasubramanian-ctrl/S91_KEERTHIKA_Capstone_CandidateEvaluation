import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const defaultUsers = [
  { name: 'Admin User', email: 'admin@evalhire.com', password: 'admin123', role: 'recruiter' },
]

const getRegisteredUsers = () => {
  try {
    const savedUsers = JSON.parse(localStorage.getItem('evalhire-users') || 'null')
    if (Array.isArray(savedUsers) && savedUsers.length > 0) {
      return savedUsers
    }
  } catch (error) {
    console.error('Unable to parse registered users.', error)
  }

  localStorage.setItem('evalhire-users', JSON.stringify(defaultUsers))
  return defaultUsers
}

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
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('evalhire-jwt')))
  const [authUser, setAuthUser] = useState(() => localStorage.getItem('evalhire-user') || '')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [authMode, setAuthMode] = useState('login')
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState('')
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [candidates, setCandidates] = useState(initialCandidates)
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialCandidates[0].id)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyShortlisted, setShowOnlyShortlisted] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [resumeUploadError, setResumeUploadError] = useState('')
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState('')
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const googleButtonRef = useRef(null)

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

  const handleLoginInput = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleSignupInput = (event) => {
    const { name, value } = event.target
    setSignupForm((current) => ({ ...current, [name]: value }))
  }

  useEffect(() => {
    const token = localStorage.getItem('evalhire-jwt')
    if (!token) return

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Token invalid')
        }

        const data = await response.json()
        setAuthUser(data.user.username)
        setIsAuthenticated(true)
      } catch (error) {
        handleLogout()
      }
    }

    verifyToken()
  }, [])

  const handleLogin = (event) => {
    event.preventDefault()

    const email = loginForm.email.trim().toLowerCase()
    const password = loginForm.password

    if (!email || !password) {
      setLoginError('Please enter your registered email and password.')
      return
    }

    const registeredUsers = getRegisteredUsers()
    const account = registeredUsers.find(
      (user) => user.email.toLowerCase() === email && user.password === password,
    )

    if (!account) {
      setLoginError('Invalid email or password. Use the exact credentials from your signup or admin account.')
      return
    }

    const token = `${account.email}-${Date.now()}`
    localStorage.setItem('evalhire-jwt', token)
    localStorage.setItem('evalhire-user', account.name || account.email)
    setAuthUser(account.name || account.email)
    setIsAuthenticated(true)
    setLoginError('')
    setSignupError('')
    setSignupSuccess('')
  }

  const handleSignup = (event) => {
    event.preventDefault()

    const name = signupForm.name.trim()
    const email = signupForm.email.trim().toLowerCase()
    const password = signupForm.password
    const confirmPassword = signupForm.confirmPassword

    if (!name || !email || !password || !confirmPassword) {
      setSignupError('Please fill in all sign-up fields.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSignupError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setSignupError('Passwords do not match. Please re-enter the same password.')
      return
    }

    const registeredUsers = getRegisteredUsers()
    const alreadyExists = registeredUsers.some((user) => user.email.toLowerCase() === email)

    if (alreadyExists) {
      setSignupError('This email is already registered. Please use a different email or log in.')
      return
    }

    const newUser = { name, email, password, role: 'recruiter' }
    const updatedUsers = [...registeredUsers, newUser]
    localStorage.setItem('evalhire-users', JSON.stringify(updatedUsers))

    setSignupError('')
    setSignupSuccess('Account created successfully. You can now log in with your exact email and password.')
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '' })
    setLoginForm({ email, password: '' })
    setAuthMode('login')
  }

  const handleGoogleCredentialResponse = async (response) => {
    const credential = response?.credential

    if (!credential) {
      setLoginError('Google sign-in was cancelled or failed.')
      return
    }

    try {
      const googleResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential, clientId: GOOGLE_CLIENT_ID }),
      })

      const data = await googleResponse.json()

      if (!googleResponse.ok) {
        throw new Error(data.message || 'Google sign-in failed')
      }

      localStorage.setItem('evalhire-jwt', data.token)
      localStorage.setItem('evalhire-user', data.user.name || data.user.username)
      setAuthUser(data.user.name || data.user.username)
      setIsAuthenticated(true)
      setLoginError('')
    } catch (error) {
      setLoginError(error.message || 'Google sign-in failed')
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const initializeGoogleSignIn = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      })
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.body.appendChild(script)

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn()
    }

    return () => {
      script.remove()
    }
  }, [])

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setLoginError('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your client .env file and restart the app.')
      return
    }

    if (!window.google?.accounts?.id) {
      setLoginError('Google sign-in is still loading. Please try again in a moment.')
      return
    }

    setLoginError('')
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setLoginError('Google sign-in was not displayed. Please check the Google client configuration and try again.')
      }
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('evalhire-jwt')
    localStorage.removeItem('evalhire-user')
    setIsAuthenticated(false)
    setAuthUser('')
    setLoginForm({ email: '', password: '' })
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '' })
    setLoginError('')
    setSignupError('')
    setSignupSuccess('')
  }

  const startEditingCandidate = (candidate) => {
    setEditingCandidate({ ...candidate })
    setResumeUploadError('')
    setResumeUploadSuccess('')
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !editingCandidate) {
      return
    }

    const formData = new FormData()
    formData.append('resume', file)

    setIsUploadingResume(true)
    setResumeUploadError('')
    setResumeUploadSuccess('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('evalhire-jwt')}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Resume upload failed')
      }

      const updatedCandidate = {
        ...editingCandidate,
        resumeUrl: data.fileUrl,
      }

      setEditingCandidate(updatedCandidate)
      setCandidates((current) =>
        current.map((candidate) =>
          candidate.id === updatedCandidate.id ? { ...candidate, resumeUrl: data.fileUrl } : candidate,
        ),
      )
      setResumeUploadSuccess(`Uploaded ${data.fileName}`)
    } catch (error) {
      setResumeUploadError(error.message || 'Resume upload failed')
    } finally {
      setIsUploadingResume(false)
      event.target.value = ''
    }
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

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-block auth-brand">
            <div className="brand-mark">E</div>
            <div>
              <p className="brand-title">EvalHire</p>
              <span>Recruitment Suite</span>
            </div>
          </div>

          <h1>Sign in</h1>
          <p className="auth-subtitle">Access the recruiter dashboard</p>

          <div className="social-auth-block">
            <button type="button" className="google-btn" onClick={handleGoogleLogin} ref={googleButtonRef}>
              <span className="google-icon">G</span>
              {GOOGLE_CLIENT_ID ? 'Continue with Google' : 'Google sign-in not configured'}
            </button>
          </div>

          <div className="auth-toggle-row">
            <button
              type="button"
              className={`auth-toggle ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login')
                setSignupError('')
                setSignupSuccess('')
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-toggle ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signup')
                setLoginError('')
              }}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginInput}
                  placeholder="recruiter@company.com"
                  className="input-field"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginInput}
                  placeholder="Enter your password"
                  className="input-field"
                />
              </label>

              {loginError && <p className="error-text">{loginError}</p>}

              <button className="primary-btn auth-submit" type="submit">
                Login
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignup}>
              <label>
                Full name
                <input
                  type="text"
                  name="name"
                  value={signupForm.name}
                  onChange={handleSignupInput}
                  placeholder="Jane Recruiter"
                  className="input-field"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={signupForm.email}
                  onChange={handleSignupInput}
                  placeholder="recruiter@company.com"
                  className="input-field"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={signupForm.password}
                  onChange={handleSignupInput}
                  placeholder="Create a password"
                  className="input-field"
                />
              </label>

              <label>
                Confirm password
                <input
                  type="password"
                  name="confirmPassword"
                  value={signupForm.confirmPassword}
                  onChange={handleSignupInput}
                  placeholder="Repeat your password"
                  className="input-field"
                />
              </label>

              {signupError && <p className="error-text">{signupError}</p>}
              {signupSuccess && <p className="success-text">{signupSuccess}</p>}

              <button className="primary-btn auth-submit" type="submit">
                Create account
              </button>
            </form>
          )}
        </div>
      </div>
    )
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
            <span className="user-badge">Signed in as {authUser}</span>
            <button className="ghost-btn" type="button" onClick={exportReport}>
              Export
            </button>
            <button className="primary-btn" type="button" onClick={addCandidate}>
              Add candidate
            </button>
            <button className="secondary-btn" type="button" onClick={handleLogout}>
              Logout
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

              <div className="resume-block">
                {selectedCandidate.resumeUrl ? (
                  <a className="resume-link" href={`${API_BASE_URL}${selectedCandidate.resumeUrl}`} target="_blank" rel="noreferrer">
                    View uploaded resume
                  </a>
                ) : (
                  <span className="empty-resume">No resume uploaded yet</span>
                )}
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

                <label className="upload-label">
                  Resume upload
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="input-field file-input" />
                </label>

                {isUploadingResume && <p className="upload-status">Uploading resume...</p>}
                {resumeUploadError && <p className="error-text upload-error">{resumeUploadError}</p>}
                {resumeUploadSuccess && <p className="success-text upload-success">{resumeUploadSuccess}</p>}

                {editingCandidate.resumeUrl && (
                  <a className="resume-link" href={`${API_BASE_URL}${editingCandidate.resumeUrl}`} target="_blank" rel="noreferrer">
                    Open saved resume
                  </a>
                )}

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
