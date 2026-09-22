require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./database');
const { Candidate, Recruiter, Evaluation } = require('./models');

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'evalhire-secret-key';

app.use(cors());
app.use(express.json());

connectDB();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.get('/', (req, res) => {
  res.json({
    message: 'Candidate Evaluation Platform API is running',
    status: 'success'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'candidate-evaluation-server',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === 'admin' && password === 'admin123') {
    const payload = { username, role: 'recruiter' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      token,
      user: {
        username,
        role: 'recruiter'
      }
    });
  }

  return res.status(401).json({ message: 'Invalid username or password' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      username: req.user.username,
      role: req.user.role
    }
  });
});

app.get('/api/candidates', authenticateToken, async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch candidates', error: error.message });
  }
});

app.get('/api/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch candidate', error: error.message });
  }
});

app.post('/api/candidates', authenticateToken, async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create candidate', error: error.message });
  }
});

app.put('/api/candidates/:id', authenticateToken, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update candidate', error: error.message });
  }
});

app.get('/api/recruiters', authenticateToken, async (req, res) => {
  try {
    const recruiters = await Recruiter.find().sort({ createdAt: -1 });
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiters', error: error.message });
  }
});

app.get('/api/recruiters/:id', authenticateToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id).populate('managedCandidates');
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiter', error: error.message });
  }
});

app.get('/api/recruiters/:id/candidates', authenticateToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id).populate('managedCandidates');
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.json(recruiter.managedCandidates);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiter candidates', error: error.message });
  }
});

app.post('/api/recruiters', authenticateToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.create(req.body);
    res.status(201).json(recruiter);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create recruiter', error: error.message });
  }
});

app.put('/api/recruiters/:id', authenticateToken, async (req, res) => {
  try {
    const recruiter = await Recruiter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.json(recruiter);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update recruiter', error: error.message });
  }
});

app.post('/api/recruiters/:recruiterId/candidates', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.body;
    const recruiter = await Recruiter.findById(req.params.recruiterId);
    const candidate = await Candidate.findById(candidateId);

    if (!recruiter || !candidate) {
      return res.status(404).json({ message: 'Recruiter or candidate not found' });
    }

    candidate.assignedRecruiter = recruiter._id;
    recruiter.managedCandidates = recruiter.managedCandidates || [];

    if (!recruiter.managedCandidates.some((id) => id.toString() === candidate._id.toString())) {
      recruiter.managedCandidates.push(candidate._id);
    }

    await candidate.save();
    await recruiter.save();

    res.status(201).json({
      message: 'Candidate assigned to recruiter',
      recruiter: await Recruiter.findById(recruiter._id).populate('managedCandidates'),
      candidate
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to assign candidate to recruiter', error: error.message });
  }
});

app.get('/api/evaluations', authenticateToken, async (req, res) => {
  try {
    const evaluations = await Evaluation.find().populate('candidate recruiter').sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch evaluations', error: error.message });
  }
});

app.get('/api/evaluations/:id', authenticateToken, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id).populate('candidate recruiter');
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch evaluation', error: error.message });
  }
});

app.post('/api/evaluations', authenticateToken, async (req, res) => {
  try {
    const evaluation = await Evaluation.create(req.body);
    const populatedEvaluation = await evaluation.populate('candidate recruiter');
    res.status(201).json(populatedEvaluation);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create evaluation', error: error.message });
  }
});

app.put('/api/evaluations/:id', authenticateToken, async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('candidate recruiter');

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.json(evaluation);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update evaluation', error: error.message });
  }
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
      return;
    }

    throw error;
  });
}

startServer(DEFAULT_PORT);
