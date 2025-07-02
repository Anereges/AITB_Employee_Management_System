const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  date: { type: Date, required: true },
  tasksCompleted: { type: Number, default: 0 },
  hoursWorked: { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['excellent', 'good', 'average', 'poor'],
    default: 'average'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);