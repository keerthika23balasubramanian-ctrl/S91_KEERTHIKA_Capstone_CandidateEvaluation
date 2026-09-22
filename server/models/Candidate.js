const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: Number,
      min: 0,
      default: 0
    },
    currentCompany: {
      type: String,
      default: 'Not provided'
    },
    location: {
      type: String,
      default: 'Unknown'
    },
    assignedRecruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      default: null
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'],
      default: 'Applied'
    },
    source: {
      type: String,
      default: 'Career Portal'
    },
    interviewDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Candidate', candidateSchema);
