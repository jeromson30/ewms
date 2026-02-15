import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Phone, Calendar, Clock, Trash2, X, Pencil, Check, AlertCircle, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import './PlanningPage.css';

const eventTypeConfig = {
  meeting: { label: 'Réunion', color: '#3b82f6' },
  deadline: { label: 'Deadline', color: '#ef4444' },
  milestone: { label: 'Jalon', color: '#8b5cf6' },
  oncall: { label: 'Astreinte', color: '#f59e0b' },
  other: { label: 'Autre', color: '#64748b' },
};

const onCallTypeConfig = {
  primary: { label: 'Primaire', color: '#ef4444' },
  secondary: { label: 'Secondaire', color: '#f59e0b' },
  backup: { label: 'Backup', color: '#64748b' },
};

export default function PlanningPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [planning, setPlanning] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showOnCallModal, setShowOnCallModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const [eventForm, setEventForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    allDay: false, type: 'other', color: '#6366f1', assignees: [],
  });

  const [onCallForm, setOnCallForm] = useState({
    user: '', startDate: '', endDate: '', type: 'primary', notes: '',
  });

  useEffect(() => {
    loadPlanning();
    api.get('/auth/users').then(res => setUsers(res.data)).catch(() => {});
  }, [projectId]);

  const loadPlanning = async () => {
    try {
      const res = await api.get(`/planning/${projectId}`);
      setPlanning(res.data);
    } catch { /* handled */ }
  };

  const canEditEvent = (ev) => {
    const isCreator = ev.createdBy?._id === user?.id || ev.createdBy === user?.id;
    return isCreator || user?.role === 'admin' || user?.role === 'manager';
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/planning/${projectId}/events`, eventForm);
      await loadPlanning();
      setShowEventModal(false);
      setEventForm({ title: '', description: '', startDate: '', endDate: '', allDay: false, type: 'other', color: '#6366f1', assignees: [] });
      showToast('Événement créé avec succès');
    } catch {
      showToast('Erreur lors de la création de l\'événement', 'error');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/planning/${projectId}/events/${selectedEvent._id}`, eventForm);
      await loadPlanning();
      setSelectedEvent(null);
      setEditMode(false);
      showToast('Événement modifié avec succès');
    } catch {
      showToast('Erreur lors de la modification de l\'événement', 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await api.delete(`/planning/${projectId}/events/${eventId}`);
      await loadPlanning();
      setSelectedEvent(null);
      setEditMode(false);
      showToast('Événement supprimé');
    } catch {
      showToast('Erreur lors de la suppression de l\'événement', 'error');
    }
  };

  const handleAddOnCall = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/planning/${projectId}/oncall`, onCallForm);
      await loadPlanning();
      setShowOnCallModal(false);
      setOnCallForm({ user: '', startDate: '', endDate: '', type: 'primary', notes: '' });
      showToast('Astreinte créée avec succès');
    } catch {
      showToast('Erreur lors de la création de l\'astreinte', 'error');
    }
  };

  const handleDeleteOnCall = async (onCallId) => {
    if (!window.confirm('Supprimer cette astreinte ?')) return;
    try {
      await api.delete(`/planning/${projectId}/oncall/${onCallId}`);
      await loadPlanning();
      showToast('Astreinte supprimée');
    } catch {
      showToast('Erreur lors de la suppression de l\'astreinte', 'error');
    }
  };

  const openEventDetail = (ev, e) => {
    e.stopPropagation();
    setSelectedEvent(ev);
    setEditMode(false);
    const startStr = ev.startDate ? format(parseISO(ev.startDate), "yyyy-MM-dd'T'HH:mm") : '';
    const endStr = ev.endDate ? format(parseISO(ev.endDate), "yyyy-MM-dd'T'HH:mm") : '';
    setEventForm({
      title: ev.title,
      description: ev.description || '',
      startDate: startStr,
      endDate: endStr,
      allDay: ev.allDay || false,
      type: ev.type || 'other',
      color: ev.color || '#6366f1',
      assignees: ev.assignees?.map(a => a._id || a.id) || [],
    });
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setEditMode(false);
  };

  // Calendar rendering
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { locale: fr });
  const calEnd = endOfWeek(monthEnd, { locale: fr });

  const calendarDays = [];
  let day = calStart;
  while (day <= calEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date) => {
    if (!planning) return [];
    return planning.events.filter(ev => {
      const start = parseISO(ev.startDate);
      const end = parseISO(ev.endDate);
      return isSameDay(date, start) || isSameDay(date, end) ||
        isWithinInterval(date, { start, end });
    });
  };

  const getOnCallsForDay = (date) => {
    if (!planning) return [];
    return planning.onCallSchedule.filter(oc => {
      const start = parseISO(oc.startDate);
      const end = parseISO(oc.endDate);
      return isSameDay(date, start) || isSameDay(date, end) ||
        isWithinInterval(date, { start, end });
    });
  };

  const openNewEventForDate = (date) => {
    const startStr = format(date, "yyyy-MM-dd'T'09:00");
    const endStr = format(date, "yyyy-MM-dd'T'10:00");
    setEventForm({ title: '', description: '', startDate: startStr, endDate: endStr, allDay: false, type: 'other', color: '#6366f1', assignees: [] });
    setSelectedDate(date);
    setShowEventModal(true);
  };

  if (!planning) return <div className="loader-fullscreen"><div className="loader" /></div>;

  return (
    <div className="planning">
      <div className="planning-header">
        <h2>Planning</h2>
        <div className="planning-tabs">
          <button
            className={`planning-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={16} /> Calendrier
          </button>
          <button
            className={`planning-tab ${activeTab === 'oncall' ? 'active' : ''}`}
            onClick={() => setActiveTab('oncall')}
          >
            <Phone size={16} /> Astreintes
          </button>
        </div>
        <div className="planning-actions">
          <button className="btn btn-primary btn-sm" onClick={() => {
            const now = new Date();
            const startStr = format(now, "yyyy-MM-dd'T'HH:mm");
            const endDate = new Date(now.getTime() + 60 * 60 * 1000);
            const endStr = format(endDate, "yyyy-MM-dd'T'HH:mm");
            setEventForm({ title: '', description: '', startDate: startStr, endDate: endStr, allDay: false, type: 'other', color: '#6366f1', assignees: [] });
            setShowEventModal(true);
          }}>
            <Plus size={16} /> Événement
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowOnCallModal(true)}>
            <Phone size={16} /> Astreinte
          </button>
        </div>
      </div>

      {activeTab === 'calendar' && (
        <div className="calendar">
          <div className="calendar-nav">
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="calendar-month">{format(currentDate, 'MMMM yyyy', { locale: fr })}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-grid">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            {calendarDays.map((d, i) => {
              const events = getEventsForDay(d);
              const onCalls = getOnCallsForDay(d);
              const isToday = isSameDay(d, new Date());
              const isCurrentMonth = isSameMonth(d, currentDate);

              return (
                <div
                  key={i}
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${selectedDate && isSameDay(d, selectedDate) ? 'selected' : ''}`}
                  onClick={() => openNewEventForDate(d)}
                >
                  <span className="calendar-day-num">{format(d, 'd')}</span>
                  <div className="calendar-day-events">
                    {onCalls.slice(0, 1).map(oc => (
                      <div
                        key={oc._id}
                        className="calendar-event oncall-event"
                        style={{ background: onCallTypeConfig[oc.type]?.color || '#f59e0b' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={8} /> {oc.user?.firstName || 'Astreinte'}
                      </div>
                    ))}
                    {events.slice(0, 2).map(ev => (
                      <div
                        key={ev._id}
                        className="calendar-event calendar-event-clickable"
                        style={{ background: eventTypeConfig[ev.type]?.color || ev.color }}
                        onClick={(e) => openEventDetail(ev, e)}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {(events.length + onCalls.length) > 3 && (
                      <span className="calendar-more">+{events.length + onCalls.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'oncall' && (
        <div className="oncall-list">
          <div className="oncall-grid">
            {planning.onCallSchedule.length === 0 && (
              <div className="empty-state">
                <Phone size={40} className="text-muted" />
                <h3>Aucune astreinte planifiée</h3>
                <p className="text-secondary">Ajoutez une astreinte pour commencer</p>
              </div>
            )}
            {planning.onCallSchedule.map(oc => {
              const config = onCallTypeConfig[oc.type] || onCallTypeConfig.primary;
              return (
                <div key={oc._id} className="oncall-card" style={{ borderLeftColor: config.color }}>
                  <div className="oncall-card-header">
                    <div className="flex items-center gap-2">
                      <div className="avatar avatar-sm">
                        {oc.user?.firstName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{oc.user ? `${oc.user.firstName} ${oc.user.lastName}` : 'Utilisateur'}</p>
                        <span className="badge" style={{ background: `${config.color}20`, color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <button className="btn-icon btn-ghost" onClick={() => handleDeleteOnCall(oc._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="oncall-card-dates">
                    <Clock size={14} />
                    <span>
                      {format(parseISO(oc.startDate), 'dd MMM yyyy HH:mm', { locale: fr })}
                      {' — '}
                      {format(parseISO(oc.endDate), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                  {oc.notes && <p className="oncall-card-notes">{oc.notes}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming events sidebar */}
      {activeTab === 'calendar' && (
        <div className="planning-upcoming">
          <h4>Événements à venir</h4>
          {planning.events
            .filter(ev => new Date(ev.startDate) >= new Date())
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 5)
            .map(ev => (
              <div key={ev._id} className="upcoming-event upcoming-event-clickable" onClick={(e) => openEventDetail(ev, e)}>
                <div className="upcoming-event-dot" style={{ background: eventTypeConfig[ev.type]?.color || ev.color }} />
                <div className="upcoming-event-info">
                  <p className="text-sm font-semibold">{ev.title}</p>
                  <p className="text-sm text-muted">
                    {format(parseISO(ev.startDate), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          {planning.events.filter(ev => new Date(ev.startDate) >= new Date()).length === 0 && (
            <p className="text-sm text-muted" style={{ padding: '1rem 0' }}>Aucun événement à venir</p>
          )}
        </div>
      )}

      {/* Event Detail / Edit Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={closeEventDetail}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? 'Modifier l\'événement' : selectedEvent.title}</h3>
              <button className="btn-icon btn-ghost" onClick={closeEventDetail}><X size={18} /></button>
            </div>

            {editMode ? (
              <form onSubmit={handleUpdateEvent}>
                <div className="form-group">
                  <label className="form-label">Titre</label>
                  <input className="input" required value={eventForm.title}
                    onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="input textarea" value={eventForm.description}
                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Début</label>
                    <input className="input" type="datetime-local" required value={eventForm.startDate}
                      onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Fin</label>
                    <input className="input" type="datetime-local" required value={eventForm.endDate}
                      onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="input select" value={eventForm.type}
                    onChange={e => setEventForm({ ...eventForm, type: e.target.value })}>
                    <option value="meeting">Réunion</option>
                    <option value="deadline">Deadline</option>
                    <option value="milestone">Jalon</option>
                    <option value="oncall">Astreinte</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Participants</label>
                  <div className="assignees-picker">
                    {users.map(u => {
                      const isSelected = eventForm.assignees?.includes(u._id);
                      return (
                        <button
                          key={u._id}
                          type="button"
                          className={`assignee-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            const newAssignees = isSelected
                              ? eventForm.assignees.filter(id => id !== u._id)
                              : [...(eventForm.assignees || []), u._id];
                            setEventForm({ ...eventForm, assignees: newAssignees });
                          }}
                        >
                          <span className="assignee-chip-avatar">{u.firstName?.[0]?.toUpperCase()}</span>
                          {u.firstName} {u.lastName}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">Enregistrer</button>
                </div>
              </form>
            ) : (
              <div className="event-detail">
                <div className="event-detail-row">
                  <span className="badge" style={{ background: `${eventTypeConfig[selectedEvent.type]?.color || '#64748b'}20`, color: eventTypeConfig[selectedEvent.type]?.color || '#64748b' }}>
                    {eventTypeConfig[selectedEvent.type]?.label || 'Autre'}
                  </span>
                </div>
                {selectedEvent.description && (
                  <p className="event-detail-desc">{selectedEvent.description}</p>
                )}
                <div className="event-detail-row">
                  <Clock size={14} className="text-muted" />
                  <span className="text-sm">
                    {format(parseISO(selectedEvent.startDate), 'dd MMM yyyy HH:mm', { locale: fr })}
                    {' — '}
                    {format(parseISO(selectedEvent.endDate), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
                {selectedEvent.assignees?.length > 0 && (
                  <div className="event-detail-row">
                    <Users size={14} className="text-muted" />
                    <div className="event-detail-assignees">
                      {selectedEvent.assignees.map(a => (
                        <span key={a._id || a.id} className="assignee-badge">
                          <span className="assignee-badge-avatar">{a.firstName?.[0]?.toUpperCase()}</span>
                          {a.firstName} {a.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEvent.createdBy && (
                  <div className="event-detail-row">
                    <span className="text-sm text-muted">
                      Créé par {selectedEvent.createdBy.firstName} {selectedEvent.createdBy.lastName}
                    </span>
                  </div>
                )}
                {canEditEvent(selectedEvent) && (
                  <div className="modal-actions">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(selectedEvent._id)}>
                      <Trash2 size={14} /> Supprimer
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setEditMode(true)}>
                      <Pencil size={14} /> Modifier
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouvel événement</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowEventModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddEvent}>
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input className="input" required value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input textarea" value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Début</label>
                  <input className="input" type="datetime-local" required value={eventForm.startDate}
                    onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Fin</label>
                  <input className="input" type="datetime-local" required value={eventForm.endDate}
                    onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="input select" value={eventForm.type}
                  onChange={e => setEventForm({ ...eventForm, type: e.target.value })}>
                  <option value="meeting">Réunion</option>
                  <option value="deadline">Deadline</option>
                  <option value="milestone">Jalon</option>
                  <option value="oncall">Astreinte</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Participants</label>
                <div className="assignees-picker">
                  {users.map(u => {
                    const isSelected = eventForm.assignees?.includes(u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        className={`assignee-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          const newAssignees = isSelected
                            ? eventForm.assignees.filter(id => id !== u._id)
                            : [...(eventForm.assignees || []), u._id];
                          setEventForm({ ...eventForm, assignees: newAssignees });
                        }}
                      >
                        <span className="assignee-chip-avatar">{u.firstName?.[0]?.toUpperCase()}</span>
                        {u.firstName} {u.lastName}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* On-Call Modal */}
      {showOnCallModal && (
        <div className="modal-overlay" onClick={() => setShowOnCallModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouvelle astreinte</h3>
              <button className="btn-icon btn-ghost" onClick={() => setShowOnCallModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddOnCall}>
              <div className="form-group">
                <label className="form-label">Personne d'astreinte</label>
                <select className="input select" required value={onCallForm.user}
                  onChange={e => setOnCallForm({ ...onCallForm, user: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Début</label>
                  <input className="input" type="datetime-local" required value={onCallForm.startDate}
                    onChange={e => setOnCallForm({ ...onCallForm, startDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Fin</label>
                  <input className="input" type="datetime-local" required value={onCallForm.endDate}
                    onChange={e => setOnCallForm({ ...onCallForm, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="input select" value={onCallForm.type}
                  onChange={e => setOnCallForm({ ...onCallForm, type: e.target.value })}>
                  <option value="primary">Primaire</option>
                  <option value="secondary">Secondaire</option>
                  <option value="backup">Backup</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="input textarea" value={onCallForm.notes}
                  onChange={e => setOnCallForm({ ...onCallForm, notes: e.target.value })}
                  placeholder="Instructions spécifiques..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOnCallModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
