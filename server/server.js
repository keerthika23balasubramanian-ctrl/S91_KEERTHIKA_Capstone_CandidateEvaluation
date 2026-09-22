require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const { Candidate, Recruiter, Evaluation } = require('./models');

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

connectDB();

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

app.get('/api/candidates', async (req, res) => {
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

app.post('/api/candidates', async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create candidate', error: error.message });
  }
});

app.get('/api/recruiters', async (req, res) => {
  try {
    const recruiters = await Recruiter.find().sort({ createdAt: -1 });
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiters', error: error.message });
  }
});

app.get('/api/recruiters/:id', async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiter', error: error.message });
  }
});

app.post('/api/recruiters', async (req, res) => {
  try {
    const recruiter = await Recruiter.create(req.body);
    res.status(201).json(recruiter);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create recruiter', error: error.message });
  }
});

app.get('/api/evaluations', async (req, res) => {
  try {
    const evaluations = await Evaluation.find().populate('candidate recruiter').sort({ createdAt: -1 });
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch evaluations', error: error.message });
  }
});

app.get('/api/evaluations/:id', async (req, res) => {
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

app.post('/api/evaluations', async (req, res) => {
  try {
    const evaluation = await Evaluation.create(req.body);
    const populatedEvaluation = await evaluation.populate('candidate recruiter');
    res.status(201).json(populatedEvaluation);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create evaluation', error: error.message });
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
