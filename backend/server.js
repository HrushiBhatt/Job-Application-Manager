const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

const DATA_FILE = path.join(__dirname, 'data', 'applications.json');

function loadApplications() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveApplications(apps) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), 'utf8');
}

app.use(cors());
app.use(express.json());

app.get('/api/applications', (req, res) => {
  const apps = loadApplications();
  res.json(apps);
});

app.post('/api/applications', (req, res) => {
  const { company, position, location, salary, status, appliedDate, notes } = req.body;

  if (!company || !position || !status || !appliedDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const apps = loadApplications();
  const newApp = {
    id: Date.now(),
    company,
    position,
    location: location || '',
    salary: salary || '',
    status,
    appliedDate,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  apps.push(newApp);
  saveApplications(apps);
  res.status(201).json(newApp);
});

app.put('/api/applications/:id', (req, res) => {
  const id = Number(req.params.id);
  const apps = loadApplications();
  const index = apps.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const existing = apps[index];
  const updates = req.body || {};
  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt
  };

  apps[index] = updated;
  saveApplications(apps);
  res.json(updated);
});

app.delete('/api/applications/:id', (req, res) => {
  const id = Number(req.params.id);
  const apps = loadApplications();
  const filtered = apps.filter(a => a.id !== id);

  if (filtered.length === apps.length) {
    return res.status(404).json({ message: 'Application not found' });
  }

  saveApplications(filtered);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
