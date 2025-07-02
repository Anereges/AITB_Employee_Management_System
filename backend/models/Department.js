const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    default: null // Allows department without a manager initially
  },
  location: {
    type: String,
    trim: true
  },
  budget: { 
    type: Number, 
    min: [0, 'Budget cannot be negative'],
    default: 0 // Default budget value
  },
  description: { 
    type: String, 
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // Include virtuals when converting to JSON
  toObject: { virtuals: true } // Include virtuals when converting to object
});

// Virtual for department employees
departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department',
  options: { sort: { fullName: 1 } } // Example: sort employees by name
});

module.exports = mongoose.model('Department', departmentSchema);
