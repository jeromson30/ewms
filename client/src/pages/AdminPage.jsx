import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, CheckCircle2, ClipboardList, Save, X, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'member') loadUsers();
  }, [user]);

  if (user?.role === 'member') {
    return <Navigate to="/" />;
  }

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch { /* handled */ }
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const res = await api.put(`/admin/users/${id}`, editForm);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, ...res.data } : u));
      setEditingId(null);
    } catch { /* handled */ }
    setSaving(false);
  };

  const roleLabels = { admin: 'Admin', manager: 'Manager', member: 'Membre' };
  const roleBadgeClass = { admin: 'badge-danger', manager: 'badge-warning', member: 'badge-primary' };

  const totalAssigned = users.reduce((sum, u) => sum + (u.stats?.assigned || 0), 0);
  const totalCompleted = users.reduce((sum, u) => sum + (u.stats?.completed || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Administration</h1>
          <p className="text-secondary">Gestion des utilisateurs et statistiques</p>
        </div>
      </div>

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <Users size={20} />
          <div>
            <span className="admin-stat-value">{users.length}</span>
            <span className="admin-stat-label">Utilisateurs</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <ClipboardList size={20} />
          <div>
            <span className="admin-stat-value">{totalAssigned}</span>
            <span className="admin-stat-label">Cartes assignées</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <CheckCircle2 size={20} />
          <div>
            <span className="admin-stat-value">{totalCompleted}</span>
            <span className="admin-stat-label">Cartes terminées</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th className="text-center">Assignées</th>
              <th className="text-center">Terminées</th>
              <th className="text-center">Progression</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                {editingId === u._id ? (
                  <>
                    <td>
                      <div className="admin-edit-name">
                        <input
                          className="input admin-input"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          placeholder="Prénom"
                        />
                        <input
                          className="input admin-input"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          placeholder="Nom"
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        className="input admin-input"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Email"
                      />
                    </td>
                    <td>
                      <select
                        className="input select admin-input"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      >
                        <option value="member">Membre</option>
                        <option value="manager">Manager</option>
                        {user?.role === 'admin' && <option value="admin">Admin</option>}
                      </select>
                    </td>
                    <td className="text-center">{u.stats?.assigned || 0}</td>
                    <td className="text-center">{u.stats?.completed || 0}</td>
                    <td className="text-center">
                      <ProgressBar assigned={u.stats?.assigned} completed={u.stats?.completed} />
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn-icon btn-ghost" onClick={() => handleSave(u._id)} disabled={saving} title="Enregistrer">
                          <Save size={15} />
                        </button>
                        <button className="btn-icon btn-ghost" onClick={cancelEdit} title="Annuler">
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <div className="admin-user-cell">
                        <div className="avatar avatar-sm">
                          {((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase()}
                        </div>
                        <span>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="text-secondary">{u.email}</td>
                    <td>
                      <span className={`badge ${roleBadgeClass[u.role]}`}>
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="text-center">{u.stats?.assigned || 0}</td>
                    <td className="text-center">{u.stats?.completed || 0}</td>
                    <td className="text-center">
                      <ProgressBar assigned={u.stats?.assigned} completed={u.stats?.completed} />
                    </td>
                    <td>
                      <button className="btn-icon btn-ghost" onClick={() => startEdit(u)} title="Modifier">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgressBar({ assigned, completed }) {
  if (!assigned) return <span className="text-muted text-sm">-</span>;
  const pct = Math.round((completed / assigned) * 100);
  return (
    <div className="progress-bar-container" title={`${pct}%`}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-bar-label">{pct}%</span>
    </div>
  );
}
