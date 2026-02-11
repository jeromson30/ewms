import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Trash2, MoreHorizontal } from 'lucide-react';
import KanbanCard from './KanbanCard.jsx';
import './KanbanColumn.css';

export default function KanbanColumn({ column, onAddCard, onEditCard, onDeleteColumn }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, isOver } = useDroppable({ id: column._id });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCard(column._id, newTitle);
    setNewTitle('');
    setShowAdd(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`}
    >
      <div className="kanban-column-header">
        <div className="kanban-column-title-wrapper">
          <div className="kanban-column-indicator" style={{ background: column.color }} />
          <h3 className="kanban-column-title">{column.title}</h3>
          <span className="kanban-column-count">{column.cards.length}</span>
        </div>
        <div className="kanban-column-actions">
          <button className="btn-icon btn-ghost" onClick={() => setShowMenu(!showMenu)}>
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="kanban-column-menu">
              <button onClick={() => { onDeleteColumn(column._id); setShowMenu(false); }}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="kanban-column-cards">
        {column.cards.map((card) => (
          <KanbanCard key={card._id} card={card} onClick={() => onEditCard(card)} />
        ))}
      </div>

      {showAdd ? (
        <form onSubmit={handleAdd} className="kanban-add-card-form">
          <textarea
            className="input textarea"
            placeholder="Titre de la carte..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            rows={2}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleAdd(e); }}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm">Ajouter</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button className="kanban-add-card-btn" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Ajouter une carte
        </button>
      )}
    </div>
  );
}
