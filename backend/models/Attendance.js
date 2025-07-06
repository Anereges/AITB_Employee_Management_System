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
        return date <= new Date(); // No future attendance
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
        return !time || time > this.checkIn; // Check-out must be after check-in
      },
      message: 'Check-out must be after check-in'
    }
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day', 'on-leave'], 
    default: 'present' 
  },
  method: {
    type: String,
    enum: ['manual', 'auto', 'admin'],
    default: 'manual'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  deviceInfo: {
    type: String,
    trim: true
  },
  notes: { 
    type: String, 
    maxlength: [200, 'Notes cannot exceed 200 characters'] 
  }
}, { 
  timestamps: true,
  collection: 'attendance'
});

// Virtual to calculate working hours
attendanceSchema.virtual('workingHours').get(function() {
  if (!this.checkOut || !this.checkIn) return null;
  const diffMs = this.checkOut - this.checkIn;
  const hours = diffMs / (1000 * 60 * 60);
  return Number(hours.toFixed(2));
});

// Unique attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
