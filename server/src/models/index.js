import User from './User.js';
import Project from './Project.js';
import ProjectMember from './ProjectMember.js';
import Board from './Board.js';
import Column from './Column.js';
import Card from './Card.js';
import CardAssignee from './CardAssignee.js';
import CardLabel from './CardLabel.js';
import Planning from './Planning.js';
import Event from './Event.js';
import EventAssignee from './EventAssignee.js';
import OnCall from './OnCall.js';

// Project <-> User (owner)
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Project, { foreignKey: 'ownerId' });

// Project <-> User (members) via ProjectMember
Project.hasMany(ProjectMember, { as: 'members', foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId' });
ProjectMember.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(ProjectMember, { foreignKey: 'userId' });

// Board <-> Project
Board.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasMany(Board, { foreignKey: 'projectId', onDelete: 'CASCADE' });

// Column <-> Board
Column.belongsTo(Board, { foreignKey: 'boardId' });
Board.hasMany(Column, { as: 'columns', foreignKey: 'boardId', onDelete: 'CASCADE' });

// Card <-> Column
Card.belongsTo(Column, { foreignKey: 'columnId' });
Column.hasMany(Card, { as: 'cards', foreignKey: 'columnId', onDelete: 'CASCADE' });

// Card <-> User (assignees) via CardAssignee
Card.belongsToMany(User, { as: 'assignees', through: CardAssignee, foreignKey: 'cardId', otherKey: 'userId' });
User.belongsToMany(Card, { through: CardAssignee, foreignKey: 'userId', otherKey: 'cardId' });
Card.hasMany(CardAssignee, { foreignKey: 'cardId', onDelete: 'CASCADE' });

// Card <-> CardLabel
Card.hasMany(CardLabel, { as: 'labels', foreignKey: 'cardId', onDelete: 'CASCADE' });
CardLabel.belongsTo(Card, { foreignKey: 'cardId' });

// Planning <-> Project
Planning.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasOne(Planning, { foreignKey: 'projectId', onDelete: 'CASCADE' });

// Event <-> Planning
Event.belongsTo(Planning, { foreignKey: 'planningId' });
Planning.hasMany(Event, { as: 'events', foreignKey: 'planningId', onDelete: 'CASCADE' });

// Event <-> User (createdBy)
Event.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

// Event <-> User (assignees) via EventAssignee
Event.belongsToMany(User, { as: 'assignees', through: EventAssignee, foreignKey: 'eventId', otherKey: 'userId' });
User.belongsToMany(Event, { through: EventAssignee, foreignKey: 'userId', otherKey: 'eventId' });
Event.hasMany(EventAssignee, { foreignKey: 'eventId', onDelete: 'CASCADE' });

// OnCall <-> Planning
OnCall.belongsTo(Planning, { foreignKey: 'planningId' });
Planning.hasMany(OnCall, { as: 'onCallSchedule', foreignKey: 'planningId', onDelete: 'CASCADE' });

// OnCall <-> User
OnCall.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export {
  User,
  Project,
  ProjectMember,
  Board,
  Column,
  Card,
  CardAssignee,
  CardLabel,
  Planning,
  Event,
  EventAssignee,
  OnCall,
};
