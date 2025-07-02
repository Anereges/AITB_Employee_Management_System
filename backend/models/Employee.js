const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


// Define role enum at the top for easy reference
const ROLES = {
  EMPLOYEE: 'employee',
  HR: 'hr',
  ADMIN: 'admin'
};

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true, 
    default: function() {
      return `EMP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
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
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'Username must be 3-20 characters with only letters, numbers and underscores'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true, // This creates an index automatically - REMOVED THE DUPLICATE INDEX BELOW
    validate: {
      validator: function(v) {
        return /^[0-9]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number (10-15 digits)'
    }
  },
  password: {
    type: String,
    required: function() { return this.isSelfRegistered; },
    select: false,
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  sex: {
  type: String,
  enum: ['Male', 'Female', 'Other'],
  required: function() { return !this.isSelfRegistered; },
  trim: true
},

  department: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Department',
  required: function() { return !this.isSelfRegistered; },
  default: null
},

  position: {
    type: String,
    required: function() { return !this.isSelfRegistered; },
    trim: true,
    default: 'Pending'
  },
  companyName: {
    type: String,
    required: function() { return !this.isSelfRegistered; },
    trim: true,
    default: 'Pending'
  },
  salary: {
    type: Number,
    required: function() { return !this.isSelfRegistered; },
    min: [0, 'Salary cannot be negative'],
    default: 0
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  role: {
  type: String,
  enum: {
    values: Object.values(ROLES),
    message: `Role must be one of: ${Object.values(ROLES).join(', ')}`
  },
  required: [true, 'Role is required']
},

  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: function() {
      return !this.isSelfRegistered;
    }
  },
  isSelfRegistered: {
    type: Boolean,
    default: false
  },
  temporaryPassword: {
    type: String,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{9,18}$/.test(v);
        },
        message: 'Account number must be 9-18 digits'
      }
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: [50, 'Bank name cannot exceed 50 characters']
    },
    branch: {
      type: String,
      trim: true,
      maxlength: [50, 'Branch name cannot exceed 50 characters']
    }
  },
  taxInfo: {
    tinNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[A-Z0-9]{10,15}$/.test(v);
        },
        message: 'Invalid TIN number format'
      }
    },
    pensionNumber: {
      type: String,
      trim: true
    }
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'temporary'],
    default: 'full-time'
  },
  leaveBalances: {
    casual: { 
      type: Number, 
      default: 10,
      min: [0, 'Casual leave balance cannot be negative']
    },
    sick: { 
      type: Number, 
      default: 15,
      min: [0, 'Sick leave balance cannot be negative']
    },
    annual: { 
      type: Number, 
      default: 20,
      min: [0, 'Annual leave balance cannot be negative']
    },
    maternity: { 
      type: Number, 
      default: 90,
      min: [0, 'Maternity leave balance cannot be negative']
    },
    paternity: { 
      type: Number, 
      default: 5,
      min: [0, 'Paternity leave balance cannot be negative']
    }
  },
  usedLeaves: {
    casual: { 
      type: Number, 
      default: 0,
      min: [0, 'Used casual leave cannot be negative']
    },
    sick: { 
      type: Number, 
      default: 0,
      min: [0, 'Used sick leave cannot be negative']
    },
    annual: { 
      type: Number, 
      default: 0,
      min: [0, 'Used annual leave cannot be negative']
    },
    maternity: { 
      type: Number, 
      default: 0,
      min: [0, 'Used maternity leave cannot be negative']
    },
    paternity: { 
      type: Number, 
      default: 0,
      min: [0, 'Used paternity leave cannot be negative']
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    getters: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.temporaryPassword;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    getters: true 
  }
});

// Static method for admin registration
employeeSchema.statics.registerByAdmin = async function(employeeData) {
  // Validate required fields
  if (!employeeData.role || !Object.values(ROLES).includes(employeeData.role)) {
    throw new Error('Invalid role specified');
  }

  // Create new employee with admin-set role
  const employee = new this({
    ...employeeData,
    isSelfRegistered: false,
    isActive: true,
    registrationStatus: 'approved'
  });

  // Generate temporary password if not provided
  if (!employeeData.password) {
    const tempPassword = crypto.randomBytes(8).toString('hex');
    employee.temporaryPassword = tempPassword;
  }

  await employee.save();
  return employee;
};

// Static method for self-registration
employeeSchema.statics.selfRegister = async function(employeeData) {
  // Self-registered users are always employees
  const employee = new this({
    ...employeeData,
    role: ROLES.EMPLOYEE,
    isSelfRegistered: true,
    isActive: false,
    registrationStatus: 'pending'
  });

  await employee.save();
  return employee;
};

// Virtual for available leaves
employeeSchema.virtual('availableLeaves').get(function() {
  return {
    casual: Math.max(0, this.leaveBalances.casual - this.usedLeaves.casual),
    sick: Math.max(0, this.leaveBalances.sick - this.usedLeaves.sick),
    annual: Math.max(0, this.leaveBalances.annual - this.usedLeaves.annual),
    maternity: Math.max(0, this.leaveBalances.maternity - this.usedLeaves.maternity),
    paternity: Math.max(0, this.leaveBalances.paternity - this.usedLeaves.paternity)
  };
});

// Password hashing middleware
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Temporary password hashing
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('temporaryPassword') || !this.temporaryPassword) return next();
  
  this.temporaryPassword = await bcrypt.hash(this.temporaryPassword, 12);
  next();
});

// Password comparison method
employeeSchema.methods.comparePassword = async function(candidatePassword, isTemporary = false) {
  const passwordToCompare = isTemporary ? this.temporaryPassword : this.password;
  
  if (!passwordToCompare) {
    throw new Error('Password not available for comparison');
  }

  return await bcrypt.compare(candidatePassword, passwordToCompare);
};

// Account lock methods
employeeSchema.methods.isAccountLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

employeeSchema.methods.handleFailedLoginAttempt = async function() {
  this.loginAttempts += 1;
  
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
  }
  
  await this.save();
};

employeeSchema.methods.handleSuccessfulLogin = async function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// Password changed check
employeeSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Password reset token
employeeSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Method to apply leave deduction
employeeSchema.methods.deductLeave = async function(leaveType, days) {
  if (!this.leaveBalances[leaveType]) {
    throw new Error('Invalid leave type');
  }
  
  if (this.leaveBalances[leaveType] - this.usedLeaves[leaveType] < days) {
    throw new Error('Insufficient leave balance');
  }
  
  this.usedLeaves[leaveType] += days;
  await this.save();
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = {
  Employee,
  ROLES
};