import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  labels: [{ text: String, color: String }],
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  position: { type: Number, default: 0 },
}, { timestamps: true });

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cards: [cardSchema],
  position: { type: Number, default: 0 },
  color: { type: String, default: '#94a3b8' },
});

const boardSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  columns: [columnSchema],
}, { timestamps: true });

export default mongoose.model('Board', boardSchema);
