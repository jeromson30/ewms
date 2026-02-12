import mongoose from 'mongoose';

const onCallSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['primary', 'secondary', 'backup'],
    default: 'primary',
  },
  notes: {
    type: String,
    default: '',
  },
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  allDay: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['meeting', 'deadline', 'milestone', 'oncall', 'other'],
    default: 'other',
  },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  color: {
    type: String,
    default: '#6366f1',
  },
});

const planningSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  events: [eventSchema],
  onCallSchedule: [onCallSchema],
}, { timestamps: true });

export default mongoose.model('Planning', planningSchema);
