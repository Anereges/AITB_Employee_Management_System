const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: [true, 'Employee reference is required'] 
  },
  leaveType: { 
    type: String, 
    required: true,
    enum: ['casual', 'sick', 'annual', 'maternity', 'paternity', 'unpaid'],
    default: 'casual'
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required'],
    validate: {
      validator: function(date) {
        return date >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: { 
    type: Date, 
    required: [true, 'End date is required'],
    validate: {
      validator: function(date) {
        return date >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  days: { 
    type: Number, 
    default: function() {
      return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
  },
  reason: { 
    type: String, 
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  comments: String
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);