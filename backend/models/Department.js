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
    ref: 'Employee' 
  },
  location: String,
  budget: { 
    type: Number, 
    min: [0, 'Budget cannot be negative'] 
  },
  description: { 
    type: String, 
    maxlength: [500, 'Description cannot exceed 500 characters'] 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true } 
});

// Virtual for department employees
departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department'
});

module.exports = mongoose.model('Department', departmentSchema);