const mongoose = require('mongoose');

const evaluationCriteriaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10
    }
  },
  { _id: false }
);

const evaluationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recruiter',
      required: true
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected'],
      default: 'Pending'
    },
    summary: {
      type: String,
      maxlength: 1000,
      default: ''
    },
    criteria: {
      type: [evaluationCriteriaSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Evaluation', evaluationSchema);
