const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    department: {
      type: String,
      default: 'Hiring'
    },
    role: {
      type: String,
      default: 'Recruiter'
    },
    managedCandidates: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    }],
    permissions: {
      type: [String],
      default: ['view_candidates', 'update_status', 'add_feedback']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Recruiter', recruiterSchema);
