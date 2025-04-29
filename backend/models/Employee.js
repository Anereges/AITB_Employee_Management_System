const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); // Use bcryptjs or native bcrypt

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(\+251|0)[1-9]\d{8}$/.test(v);
      },
      message: 'Please provide a valid Ethiopian phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default in queries
  },
  role: {
    type: String,
    required: true,
    enum: ['hr', 'employee', 'manager', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  position: {
    type: String,
    required: [true, 'Position is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 🔐 Hash password before saving (only if modified)
//employeeSchema.pre('save', async function(next) {
  //if (!this.isModified('password')) return next();
  
  //try {
    //const salt = await bcrypt.genSalt(12);
    //this.password = await bcrypt.hash(this.password, salt);
    //next();
  //} catch (err) {
    //next(err);
  //}
//});

// 🔓 Optional: method to compare password for login
employeeSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
