import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Phone, Calendar, Clock, Globe, X, Trash2, Pencil, Check, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import './PlanningPage.css';
import './GlobalPlanningPage.css';

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

export default function GlobalPlanningPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [filterProject, setFilterProject] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    allDay: false, type: 'other', color: '#6366f1',
  });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = () => {
    api.get('/planning/global/all')
      .then(res => setData(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const canEditEvent = (ev) => {
    const isCreator = ev.createdBy?._id === user?.id || ev.createdBy === user?.id;
    return isCreator || user?.role === 'admin' || user?.role === 'manager';
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
    });
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setEditMode(false);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const projectId = selectedEvent.project?._id;
    if (!projectId) return;
    try {
      await api.put(`/planning/${projectId}/events/${selectedEvent._id}`, eventForm);
      loadData();
      setSelectedEvent(null);
      setEditMode(false);
      showToast('Événement modifié avec succès');
    } catch {
      showToast('Erreur lors de la modification de l\'événement', 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const projectId = selectedEvent.project?._id;
    if (!projectId) return;
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await api.delete(`/planning/${projectId}/events/${eventId}`);
      loadData();
      setSelectedEvent(null);
      setEditMode(false);
      showToast('Événement supprimé');
    } catch {
      showToast('Erreur lors de la suppression de l\'événement', 'error');
    }
  };

  const filteredEvents = data?.events?.filter(
    ev => filterProject === 'all' || ev.project?._id === filterProject
  ) || [];

  const filteredOnCalls = data?.onCallSchedule?.filter(
    oc => filterProject === 'all' || oc.project?._id === filterProject
  ) || [];

  // Calendar
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
    return filteredEvents.filter(ev => {
      const start = parseISO(ev.startDate);
      const end = parseISO(ev.endDate);
      return isSameDay(date, start) || isSameDay(date, end) ||
        isWithinInterval(date, { start, end });
    });
  };

  const getOnCallsForDay = (date) => {
    return filteredOnCalls.filter(oc => {
      const start = parseISO(oc.startDate);
      const end = parseISO(oc.endDate);
      return isSameDay(date, start) || isSameDay(date, end) ||
        isWithinInterval(date, { start, end });
    });
  };

  if (!data) return <div className="loader-fullscreen"><div className="loader" /></div>;

  return (
    <div className="planning">
      <div className="planning-header">
        <div className="flex items-center gap-2">
          <Globe size={22} className="text-secondary" />
          <h2>Planning global</h2>
        </div>
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
          <select
            className="input select global-filter-select"
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
          >
            <option value="all">Tous les projets</option>
            {data.projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
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
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                >
                  <span className="calendar-day-num">{format(d, 'd')}</span>
                  <div className="calendar-day-events">
                    {onCalls.slice(0, 1).map(oc => (
                      <div
                        key={oc._id}
                        className="calendar-event oncall-event"
                        style={{ background: onCallTypeConfig[oc.type]?.color || '#f59e0b' }}
                      >
                        <Phone size={8} /> {oc.user?.firstName || 'Astreinte'}
                      </div>
                    ))}
                    {events.slice(0, 2).map(ev => (
                      <div
                        key={ev._id}
                        className="calendar-event global-event calendar-event-clickable"
                        style={{ background: ev.project?.color || eventTypeConfig[ev.type]?.color || ev.color }}
                        title={`${ev.project?.name}: ${ev.title}`}
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
            {filteredOnCalls.length === 0 && (
              <div className="empty-state">
                <Phone size={40} className="text-muted" />
                <h3>Aucune astreinte planifiée</h3>
                <p className="text-secondary">Les astreintes de vos projets apparaitront ici</p>
              </div>
            )}
            {filteredOnCalls.map(oc => {
              const config = onCallTypeConfig[oc.type] || onCallTypeConfig.primary;
              return (
                <div key={oc._id} className="oncall-card" style={{ borderLeftColor: oc.project?.color || config.color }}>
                  <div className="oncall-card-header">
                    <div className="flex items-center gap-2">
                      <div className="avatar avatar-sm">
                        {oc.user?.firstName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{oc.user ? `${oc.user.firstName} ${oc.user.lastName}` : 'Utilisateur'}</p>
                        <div className="flex items-center gap-2">
                          <span className="badge" style={{ background: `${config.color}20`, color: config.color }}>
                            {config.label}
                          </span>
                          <span
                            className="global-project-badge"
                            style={{ background: `${oc.project?.color || '#6366f1'}20`, color: oc.project?.color || '#6366f1', cursor: 'pointer' }}
                            onClick={() => navigate(`/project/${oc.project?._id}/planning`)}
                          >
                            {oc.project?.name}
                          </span>
                        </div>
                      </div>
                    </div>
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

      {activeTab === 'calendar' && (
        <div className="planning-upcoming">
          <h4>Prochains événements</h4>
          {filteredEvents
            .filter(ev => new Date(ev.startDate) >= new Date())
            .slice(0, 8)
            .map(ev => (
              <div key={ev._id} className="upcoming-event upcoming-event-clickable" onClick={(e) => openEventDetail(ev, e)}>
                <div className="upcoming-event-dot" style={{ background: ev.project?.color || eventTypeConfig[ev.type]?.color || ev.color }} />
                <div className="upcoming-event-info">
                  <p className="text-sm font-semibold">{ev.title}</p>
                  <p className="text-sm text-muted">
                    {ev.project?.name} &middot; {format(parseISO(ev.startDate), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          {filteredEvents.filter(ev => new Date(ev.startDate) >= new Date()).length === 0 && (
            <p className="text-sm text-muted" style={{ padding: '1rem 0' }}>Aucun événement à venir</p>
          )}
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.message}
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
                  {selectedEvent.project?.name && (
                    <span
                      className="global-project-badge"
                      style={{ background: `${selectedEvent.project?.color || '#6366f1'}20`, color: selectedEvent.project?.color || '#6366f1', cursor: 'pointer' }}
                      onClick={() => navigate(`/project/${selectedEvent.project?._id}/planning`)}
                    >
                      {selectedEvent.project.name}
                    </span>
                  )}
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
    </div>
  );
}
