import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import api from '../services/api.js';
import KanbanColumn from '../components/kanban/KanbanColumn.jsx';
import KanbanCard from '../components/kanban/KanbanCard.jsx';
import CardModal from '../components/kanban/CardModal.jsx';
import './KanbanPage.css';

export default function KanbanPage() {
  const { projectId } = useParams();
  const [board, setBoard] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    loadBoard();
  }, [projectId]);

  const loadBoard = async () => {
    try {
      const res = await api.get(`/boards/${projectId}`);
      setBoard(res.data);
    } catch { /* handled */ }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const col = board.columns.find(c => c.cards.some(card => card._id === active.id));
    if (col) {
      const card = col.cards.find(c => c._id === active.id);
      setActiveCard(card);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    const sourceCol = board.columns.find(c => c.cards.some(card => card._id === active.id));
    let targetCol = board.columns.find(c => c.cards.some(card => card._id === over.id));

    if (!targetCol) {
      targetCol = board.columns.find(c => c._id === over.id);
    }

    if (!sourceCol || !targetCol) return;

    const targetIndex = targetCol.cards.findIndex(c => c._id === over.id);
    const position = targetIndex >= 0 ? targetIndex : targetCol.cards.length;

    try {
      const res = await api.post(`/boards/${projectId}/move-card`, {
        sourceColumnId: sourceCol._id,
        targetColumnId: targetCol._id,
        cardId: active.id,
        targetPosition: position,
      });
      setBoard(res.data);
    } catch { /* handled */ }
  };

  const handleAddCard = async (columnId, title) => {
    try {
      const res = await api.post(`/boards/${projectId}/columns/${columnId}/cards`, { title });
      setBoard(res.data);
    } catch { /* handled */ }
  };

  const handleUpdateCard = async (columnId, cardId, data) => {
    try {
      const res = await api.put(`/boards/${projectId}/columns/${columnId}/cards/${cardId}`, data);
      setBoard(res.data);
      setEditingCard(null);
    } catch { /* handled */ }
  };

  const handleDeleteCard = async (columnId, cardId) => {
    try {
      const res = await api.delete(`/boards/${projectId}/columns/${columnId}/cards/${cardId}`);
      setBoard(res.data);
      setEditingCard(null);
    } catch { /* handled */ }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      const res = await api.post(`/boards/${projectId}/columns`, { title: newColumnTitle });
      setBoard(res.data);
      setNewColumnTitle('');
      setShowNewColumn(false);
    } catch { /* handled */ }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm('Supprimer cette colonne et toutes ses cartes ?')) return;
    try {
      const res = await api.delete(`/boards/${projectId}/columns/${columnId}`);
      setBoard(res.data);
    } catch { /* handled */ }
  };

  if (!board) return <div className="loader-fullscreen"><div className="loader" /></div>;

  return (
    <div className="kanban">
      <div className="kanban-header">
        <h2>{board.name}</h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {board.columns.map((column) => (
            <SortableContext
              key={column._id}
              items={column.cards.map(c => c._id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                column={column}
                onAddCard={handleAddCard}
                onEditCard={(card) => setEditingCard({ ...card, columnId: column._id })}
                onDeleteColumn={handleDeleteColumn}
              />
            </SortableContext>
          ))}

          <div className="kanban-add-column">
            {showNewColumn ? (
              <form onSubmit={handleAddColumn} className="kanban-new-column-form">
                <input
                  className="input"
                  placeholder="Titre de la colonne"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  autoFocus
                  onBlur={() => { if (!newColumnTitle.trim()) setShowNewColumn(false); }}
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm">Ajouter</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewColumn(false)}>
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn btn-ghost kanban-add-col-btn" onClick={() => setShowNewColumn(true)}>
                <Plus size={18} /> Ajouter une colonne
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && <KanbanCard card={activeCard} isDragging />}
        </DragOverlay>
      </DndContext>

      {editingCard && (
        <CardModal
          card={editingCard}
          onSave={(data) => handleUpdateCard(editingCard.columnId, editingCard._id, data)}
          onDelete={() => handleDeleteCard(editingCard.columnId, editingCard._id)}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
