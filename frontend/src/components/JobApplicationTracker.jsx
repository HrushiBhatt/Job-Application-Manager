import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication
} from '../services/jobTrackerApi';

export default function JobApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    salary: '',
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [theme, setTheme] = useState('dark'); // "dark" | "light"

  useEffect(() => {
    loadApplications();
  }, []);

  // Apply theme class to body so CSS vars can switch
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  async function loadApplications() {
    try {
      const apps = await getApplications();
      setApplications(apps || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load applications from the server.');
    }
  }

  async function handleSubmit() {
    if (!formData.company || !formData.position) {
      alert('Company and position are required.');
      return;
    }

    try {
      if (editingId) {
        await updateApplication(editingId, formData);
        setEditingId(null);
      } else {
        await createApplication(formData);
      }
      await loadApplications();
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to save application.');
    }
  }

  function handleEdit(app) {
    setFormData({
      company: app.company,
      position: app.position,
      location: app.location,
      salary: app.salary,
      status: app.status,
      appliedDate: app.appliedDate,
      notes: app.notes
    });
    setEditingId(app.id);
    setIsFormOpen(true);
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(id);
        await loadApplications();
      } catch (err) {
        console.error(err);
        alert('Failed to delete application.');
      }
    }
  }

  function resetForm() {
    setFormData({
      company: '',
      position: '',
      location: '',
      salary: '',
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsFormOpen(false);
    setEditingId(null);
  }

  function getStatusColor(status) {
    const colors = {
      Applied: 'status-pill status-applied',
      'Phone Screen': 'status-pill status-phone',
      Interview: 'status-pill status-interview',
      Offer: 'status-pill status-offer',
      Rejected: 'status-pill status-rejected',
      Withdrawn: 'status-pill status-withdrawn'
    };
    return colors[status] || 'status-pill';
  }

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter(app => app.status === filterStatus);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app-root">
      <div className="app-shell">
        {/* Header */}
        <header className="app-header">
          <div className="app-title">
            <div className="icon-badge">
              <Briefcase size={24} />
            </div>
            <div>
              <h1>Job Application Tracker</h1>
              <p>Stay on top of every application, all in one place.</p>
            </div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() =>
                setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
              }
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <div className="header-meta">
              <div className="meta-item">
                <span>Total Apps</span>
                <strong>{applications.length}</strong>
              </div>
              <div className="meta-item">
                <span>Last Updated</span>
                <strong>
                  {applications.length === 0
                    ? '—'
                    : new Date(
                        Math.max(
                          ...applications.map(a =>
                            new Date(a.createdAt).getTime()
                          )
                        )
                      ).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-grid">
          {['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].map(
            status => (
              <article key={status} className="stat-card">
                <span className="stat-label">{status}</span>
                <span className="stat-value">{statusCounts[status] || 0}</span>
              </article>
            )
          )}
        </section>

        {/* Toolbar */}
        <section className="toolbar">
          <div className="toolbar-left">
            <label className="field-label">Filter by status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="select"
            >
              <option value="all">All Applications ({applications.length})</option>
              <option value="Applied">Applied</option>
              <option value="Phone Screen">Phone Screen</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Application</span>
          </button>
        </section>

        {/* Applications */}
        <section className="applications-section">
          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Briefcase size={32} />
              </div>
              <h3>No applications yet</h3>
              <p>
                Start tracking your search by adding your first application. You can always
                edit or update it later.
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="btn btn-outline"
              >
                <Plus size={18} />
                <span>Add Your First Application</span>
              </button>
            </div>
          ) : (
            <div className="applications-grid">
              {filteredApplications.map(app => (
                <article key={app.id} className="application-card">
                  <header className="application-header">
                    <div>
                      <h4>{app.position}</h4>
                      <p className="company-name">{app.company}</p>
                    </div>
                    <span className={getStatusColor(app.status)}>{app.status}</span>
                  </header>

                  <div className="application-meta">
                    {app.location && (
                      <div className="meta-chip">
                        <MapPin size={14} />
                        <span>{app.location}</span>
                      </div>
                    )}
                    {app.salary && (
                      <div className="meta-chip">
                        <DollarSign size={14} />
                        <span>{app.salary}</span>
                      </div>
                    )}
                    <div className="meta-chip">
                      <Calendar size={14} />
                      <span>
                        Applied:{' '}
                        {new Date(app.appliedDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {app.notes && (
                    <p className="application-notes">
                      {app.notes.length > 220
                        ? app.notes.slice(0, 220) + '…'
                        : app.notes}
                    </p>
                  )}

                  <footer className="application-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleEdit(app)}
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(app.id)}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      {isFormOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <header className="modal-header">
              <div>
                <h2>{editingId ? 'Edit Application' : 'New Application'}</h2>
                <p>
                  Capture the key details for this role so you can track progress and
                  follow-ups.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={resetForm}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </header>

            <form
              className="modal-body"
              onSubmit={e => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">
                    Company <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Google, Microsoft, etc."
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Position <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={e =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={e =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    placeholder="$120k - $150k"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Status <span className="required">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Applied">Applied</option>
                    <option value="Phone Screen">Phone Screen</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    Applied Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={e =>
                      setFormData({ ...formData, appliedDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-field form-field-full">
                <label className="field-label">Notes</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Interviewers, links, follow-up dates, impressions…"
                />
              </div>

              <footer className="modal-footer">
                <button type="submit" className="btn btn-primary btn-full">
                  <Save size={18} />
                  <span>{editingId ? 'Update Application' : 'Save Application'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
