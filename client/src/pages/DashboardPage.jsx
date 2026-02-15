import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Columns3, CalendarDays, Users, Trash2, Clock, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProjects } from '../context/ProjectContext.jsx';
import api from '../services/api.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, createProject, deleteProject } = useProjects();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [planningEvents, setPlanningEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [membersProject, setMembersProject] = useState(null);
  const [addMemberUserId, setAddMemberUserId] = useState('');

  useEffect(() => {
    api.get('/planning/global/all')
      .then(res => setPlanningEvents(res.data.events || []))
      .catch(() => {});
    api.get('/auth/users')
      .then(res => setAllUsers(res.data))
      .catch(() => {});
  }, []);

  const next7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = planningEvents
        .filter(e => {
          const start = new Date(e.startDate);
          const eventEnd = new Date(e.endDate);
          return start <= dayEnd && eventEnd >= dayStart;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      days.push({ date: dayStart, events: dayEvents });
    }
    return days;
  }, [planningEvents]);

  const totalEvents = useMemo(() =>
    next7Days.reduce((sum, d) => sum + d.events.length, 0)
  , [next7Days]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject(form);
      setForm({ name: '', description: '', color: '#6366f1' });
      setShowModal(false);
    } catch { /* handled */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try {
      await deleteProject(id);
    } catch { /* handled */ }
  };

  const handleAddMember = async (projectId, userId) => {
    try {
      const res = await api.post(`/projects/${projectId}/members`, { userId });
      setMembersProject(res.data);
      await loadProjects();
    } catch { /* handled */ }
  };

  const handleRemoveMember = async (projectId, userId) => {
    try {
      const res = await api.delete(`/projects/${projectId}/members/${userId}`);
      setMembersProject(res.data);
      await loadProjects();
    } catch { /* handled */ }
  };

  const openMembersModal = (project) => {
    setMembersProject(project);
    setAddMemberUserId('');
  };

  const canDelete = (project) => {
    const isOwner = project.owner?._id === user?.id || project.owner === user?.id;
    const member = project.members?.find(m => (m.user?._id || m.user) === user?.id);
    return isOwner || member?.role === 'admin' || user?.role === 'admin' || user?.role === 'manager';
  };

  const canManageProjects = user?.role === 'admin' || user?.role === 'manager';

  const colors = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Bonjour, {user?.firstName}</h1>
          <p className="text-secondary">Gérez vos projets et votre équipe</p>
        </div>
        {canManageProjects && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Nouveau projet
          </button>
        )}
      </div>

      <div className="planning-summary">
        <div className="planning-summary-header">
          <Clock size={18} />
          <h2 className="planning-summary-title">Planning des 7 prochains jours</h2>
          {totalEvents > 0 && <span className="badge badge-primary">{totalEvents}</span>}
        </div>
        <div className="planning-week-grid">
          {next7Days.map((day, i) => {
            const isToday = i === 0;
            const isTomorrow = i === 1;
            const dayLabel = isToday
              ? "Aujourd'hui"
              : isTomorrow
                ? 'Demain'
                : day.date.toLocaleDateString('fr-FR', { weekday: 'short' });
            const dateLabel = day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

            return (
              <div key={i} className={`planning-week-col ${isToday ? 'is-today' : ''}`}>
                <div className="planning-week-col-header">
                  <span className="planning-week-col-day">{dayLabel}</span>
                  <span className="planning-week-col-date">{dateLabel}</span>
                </div>
                <div className="planning-week-col-events">
                  {day.events.length === 0 && (
                    <span className="planning-week-col-empty">—</span>
                  )}
                  {day.events.map(event => {
                    const start = new Date(event.startDate);
                    return (
                      <div key={event._id} className="planning-week-event">
                        <div className="planning-week-event-dot" style={{ background: event.color || event.project?.color || '#6366f1' }} />
                        <div className="planning-week-event-info">
                          <span className="planning-week-event-title">{event.title}</span>
                          {!event.allDay && (
                            <span className="planning-week-event-time">
                              {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {event.project?.name && (
                            <span className="planning-week-event-project">{event.project.name}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project._id} className="project-card" style={{ borderTopColor: project.color }}>
            <div className="project-card-header">
              <div className="project-card-dot" style={{ background: project.color }} />
              <h3 className="project-card-name">{project.name}</h3>
              {canDelete(project) && (
                <button className="btn-icon btn-ghost" onClick={() => handleDelete(project._id)}>
                  <Trash2 size={14} />
                </button>
              )}
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
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openMembersModal(project)}
              >
                <Users size={14} /> Membres
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="empty-state">
            <Columns3 size={48} className="text-muted" />
            <h3>Aucun projet</h3>
            <p className="text-secondary">
              {canManageProjects ? 'Créez votre premier projet pour commencer' : 'Aucun projet ne vous a été assigné'}
            </p>
            {canManageProjects && (
              <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
                <Plus size={18} /> Créer un projet
              </button>
            )}
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

      {/* Members management modal */}
      {membersProject && (
        <div className="modal-overlay" onClick={() => setMembersProject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Membres — {membersProject.name}</h3>
              <button className="btn-icon btn-ghost" onClick={() => setMembersProject(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="members-list">
              {membersProject.members?.map(m => {
                const memberUser = m.user || allUsers.find(u => u._id === m.user);
                const isOwner = (memberUser?._id || memberUser?.id) === (membersProject.owner?._id || membersProject.ownerId);
                return (
                  <div key={m._id} className="member-row">
                    <div className="member-info">
                      <div className="member-avatar">
                        {memberUser?.firstName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="member-name">
                          {memberUser ? `${memberUser.firstName} ${memberUser.lastName}` : 'Utilisateur'}
                        </p>
                        <span className="member-role">
                          {isOwner ? 'Propriétaire' : m.role === 'admin' ? 'Admin' : 'Membre'}
                        </span>
                      </div>
                    </div>
                    {!isOwner && canDelete(membersProject) && (
                      <button
                        className="btn-icon btn-ghost"
                        onClick={() => handleRemoveMember(membersProject._id, memberUser?._id || memberUser?.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {canDelete(membersProject) && (() => {
              const memberIds = membersProject.members?.map(m => {
                const mu = m.user;
                return mu?._id || mu?.id || m.user;
              }) || [];
              const availableUsers = allUsers.filter(u => !memberIds.includes(u._id));
              if (availableUsers.length === 0) return null;
              return (
                <div className="add-member-section">
                  <div className="add-member-row">
                    <select
                      className="input select"
                      value={addMemberUserId}
                      onChange={(e) => setAddMemberUserId(e.target.value)}
                    >
                      <option value="">Ajouter un membre...</option>
                      {availableUsers.map(u => (
                        <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={!addMemberUserId}
                      onClick={() => {
                        if (addMemberUserId) {
                          handleAddMember(membersProject._id, addMemberUserId);
                          setAddMemberUserId('');
                        }
                      }}
                    >
                      <UserPlus size={14} /> Ajouter
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
