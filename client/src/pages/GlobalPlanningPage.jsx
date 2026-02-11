import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Phone, Calendar, Clock, Globe } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  const [data, setData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [filterProject, setFilterProject] = useState('all');

  useEffect(() => {
    api.get('/planning/global/all')
      .then(res => setData(res.data))
      .catch(() => {});
  }, []);

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
                        className="calendar-event global-event"
                        style={{ background: ev.project?.color || eventTypeConfig[ev.type]?.color || ev.color }}
                        title={`${ev.project?.name}: ${ev.title}`}
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
              <div key={ev._id} className="upcoming-event">
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
    </div>
  );
}
