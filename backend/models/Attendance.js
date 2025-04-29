const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: [true, 'Employee reference is required'] 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Attendance date cannot be in the future'
    }
  },
  checkIn: { 
    type: Date, 
    required: [true, 'Check-in time is required'] 
  },
  checkOut: { 
    type: Date,
    validate: {
      validator: function(time) {
        return !time || time > this.checkIn;
      },
      message: 'Check-out must be after check-in'
    }
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day', 'on-leave'], 
    default: 'present' 
  },
  ipAddress: String,
  deviceInfo: String,
  notes: { 
    type: String, 
    maxlength: [200, 'Notes cannot exceed 200 characters'] 
  }
}, { timestamps: true });

// Calculate working hours
attendanceSchema.virtual('workingHours').get(function() {
  if (!this.checkOut) return null;
  return ((this.checkOut - this.checkIn) / (1000 * 60 * 60)).toFixed(2); // in hours
});

// Prevent duplicate attendance records
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);