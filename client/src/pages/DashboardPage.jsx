import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Columns3, CalendarDays, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch { /* handled */ }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '', color: '#6366f1' });
      setShowModal(false);
      loadProjects();
    } catch { /* handled */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch { /* handled */ }
  };

  const colors = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Bonjour, {user?.firstName}</h1>
          <p className="text-secondary">Gérez vos projets et votre équipe</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nouveau projet
        </button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project._id} className="project-card" style={{ borderTopColor: project.color }}>
            <div className="project-card-header">
              <div className="project-card-dot" style={{ background: project.color }} />
              <h3 className="project-card-name">{project.name}</h3>
              <button className="btn-icon btn-ghost" onClick={() => handleDelete(project._id)}>
                <Trash2 size={14} />
              </button>
            </div>
            {project.description && (
              <p className="project-card-desc">{project.description}</p>
            )}
            <div className="project-card-members">
              <Users size={14} />
              <span>{project.members?.length || 0} membre{(project.members?.length || 0) > 1 ? 's' : ''}</span>
            </div>
            <div className="project-card-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/project/${project._id}/kanban`)}
              >
                <Columns3 size={14} /> Kanban
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/project/${project._id}/planning`)}
              >
                <CalendarDays size={14} /> Planning
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="empty-state">
            <Columns3 size={48} className="text-muted" />
            <h3>Aucun projet</h3>
            <p className="text-secondary">Créez votre premier projet pour commencer</p>
            <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Créer un projet
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouveau projet</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nom du projet</label>
                <input
                  className="input"
                  placeholder="Mon projet"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input textarea"
                  placeholder="Description du projet..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Couleur</label>
                <div className="color-picker">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch ${form.color === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setForm({ ...form, color: c })}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
