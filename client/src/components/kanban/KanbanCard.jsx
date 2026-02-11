import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './KanbanCard.css';

const priorityConfig = {
  low: { label: 'Basse', className: 'priority-low' },
  medium: { label: 'Moyenne', className: 'priority-medium' },
  high: { label: 'Haute', className: 'priority-high' },
  urgent: { label: 'Urgente', className: 'priority-urgent' },
};

export default function KanbanCard({ card, isDragging, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[card.priority] || priorityConfig.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
    >
      {card.labels?.length > 0 && (
        <div className="kanban-card-labels">
          {card.labels.map((label, i) => (
            <span key={i} className="kanban-card-label" style={{ background: label.color }}>
              {label.text}
            </span>
          ))}
        </div>
      )}

      <p className="kanban-card-title">{card.title}</p>

      {card.description && (
        <p className="kanban-card-desc">{card.description}</p>
      )}

      <div className="kanban-card-footer">
        <span className={`kanban-card-priority ${priority.className}`}>
          <AlertCircle size={10} />
          {priority.label}
        </span>

        {card.dueDate && (
          <span className="kanban-card-date">
            <Calendar size={10} />
            {format(new Date(card.dueDate), 'd MMM', { locale: fr })}
          </span>
        )}

        {card.assignees?.length > 0 && (
          <div className="kanban-card-assignees">
            {card.assignees.slice(0, 3).map((a, i) => (
              <div key={i} className="avatar avatar-sm" title={a.name}>
                {a.name?.[0]?.toUpperCase() || '?'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
