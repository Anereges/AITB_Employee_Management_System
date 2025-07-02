// models/Leave.js
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  leaveType: {
    type: String,
    required: true,
  },
  startDate: Date,
  endDate: Date,
  status: {
  type: String,
  enum: ['pending', 'approved', 'rejected', 'cancelled'],
  default: 'pending',
},

  approvedBy: {   
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
