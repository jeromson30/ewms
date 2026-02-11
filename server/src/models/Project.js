import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du projet est requis'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  }],
  color: {
    type: String,
    default: '#6366f1',
  },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
