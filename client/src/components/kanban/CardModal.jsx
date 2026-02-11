import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import './CardModal.css';

export default function CardModal({ card, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: card.title || '',
    description: card.description || '',
    priority: card.priority || 'medium',
    dueDate: card.dueDate ? card.dueDate.slice(0, 10) : '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      dueDate: form.dueDate || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier la carte</h3>
          <button className="btn-icon btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Titre</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="card-modal-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Priorité</label>
              <select
                className="input select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Date limite</label>
              <input
                className="input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>
              <Trash2 size={14} /> Supprimer
            </button>
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
