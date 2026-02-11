import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Columns3, CalendarDays, Plus, LogOut, FolderKanban, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data)).catch(() => {});
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await api.post('/projects', { name: newName });
      setProjects([...projects, res.data]);
      setNewName('');
      setShowNew(false);
    } catch { /* handled by interceptor */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() || '?';

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <FolderKanban size={24} className="sidebar-logo-icon" />
          <span className="sidebar-logo">TeamFlow</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link" onClick={() => setMobileOpen(false)} end>
            <LayoutDashboard size={18} />
            Tableau de bord
          </NavLink>
          <NavLink to="/planning" className="sidebar-link" onClick={() => setMobileOpen(false)}>
            <CalendarDays size={18} />
            Planning global
          </NavLink>
        </nav>

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">Projets</span>
            <button className="btn-icon btn-ghost" onClick={() => setShowNew(!showNew)}>
              <Plus size={16} />
            </button>
          </div>

          {showNew && (
            <form onSubmit={handleCreateProject} className="sidebar-new-project">
              <input
                className="input"
                placeholder="Nom du projet..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </form>
          )}

          <div className="sidebar-projects">
            {projects.map((project) => (
              <div key={project._id} className="sidebar-project">
                <div className="sidebar-project-dot" style={{ background: project.color || '#6366f1' }} />
                <span className="sidebar-project-name">{project.name}</span>
                <div className="sidebar-project-links">
                  <NavLink
                    to={`/project/${project._id}/kanban`}
                    className="sidebar-project-link"
                    title="Kanban"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Columns3 size={14} />
                  </NavLink>
                  <NavLink
                    to={`/project/${project._id}/planning`}
                    className="sidebar-project-link"
                    title="Planning"
                    onClick={() => setMobileOpen(false)}
                  >
                    <CalendarDays size={14} />
                  </NavLink>
                </div>
              </div>
            ))}
            {projects.length === 0 && !showNew && (
              <p className="text-sm text-muted" style={{ padding: '0.5rem 0.75rem' }}>
                Aucun projet
              </p>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-sm">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.firstName} {user?.lastName}</span>
              <span className="sidebar-user-role">{user?.role}</span>
            </div>
          </div>
          <button className="btn-icon btn-ghost" onClick={handleLogout} title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
