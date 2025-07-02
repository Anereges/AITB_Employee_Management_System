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
        // Attendance date cannot be in the future
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
        // Check-out must be after check-in if provided
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
  timestamps: true, // Automatically add createdAt and updatedAt fields
  collection: 'attendance' // <-- IMPORTANT: Use singular collection name matching your DB
});

// Virtual property to calculate working hours in decimal hours (e.g., 7.50)
attendanceSchema.virtual('workingHours').get(function() {
  if (!this.checkOut || !this.checkIn) return null;
  const diffMs = this.checkOut - this.checkIn;
  const hours = diffMs / (1000 * 60 * 60);
  return Number(hours.toFixed(2)); // Return as number rounded to 2 decimals
});

// Ensure unique attendance record per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
