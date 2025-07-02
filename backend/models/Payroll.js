const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: [true, 'Employee reference is required'] 
  },
  period: {
    month: { 
      type: Number, 
      required: [true, 'Month is required'], 
      min: [1, 'Month must be between 1-12'], 
      max: [12, 'Month must be between 1-12'] 
    },
    year: { 
      type: Number, 
      required: [true, 'Year is required'], 
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year must be 2100 or earlier']
    }
  },
  basicSalary: { 
    type: Number, 
    required: [true, 'Basic salary is required'], 
    min: [0, 'Basic salary cannot be negative'] 
  },
  allowances: [{
    name: { 
      type: String, 
      required: [true, 'Allowance name is required'],
      trim: true,
      maxlength: [50, 'Allowance name cannot exceed 50 characters']
    },
    amount: { 
      type: Number, 
      required: [true, 'Allowance amount is required'], 
      min: [0, 'Allowance amount cannot be negative'] 
    },
    isTaxable: {
      type: Boolean,
      default: true
    }
  }],
  deductions: [{
    name: { 
      type: String, 
      required: [true, 'Deduction name is required'],
      trim: true,
      maxlength: [50, 'Deduction name cannot exceed 50 characters']
    },
    amount: { 
      type: Number, 
      required: [true, 'Deduction amount is required'], 
      min: [0, 'Deduction amount cannot be negative'] 
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [100, 'Reason cannot exceed 100 characters']
    },
    isStatutory: {
      type: Boolean,
      default: false
    }
  }],
  overtime: {
    hours: { 
      type: Number, 
      default: 0,
      min: [0, 'Overtime hours cannot be negative']
    },
    rate: { 
      type: Number, 
      default: 0,
      min: [0, 'Overtime rate cannot be negative']
    },
    total: { 
      type: Number, 
      default: 0,
      min: [0, 'Overtime total cannot be negative']
    }
  },
  tax: { 
    type: Number, 
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  bonus: {
    type: Number,
    default: 0,
    min: [0, 'Bonus cannot be negative']
  },
  netPay: { 
    type: Number, 
    required: [true, 'Net pay is required'],
    min: [0, 'Net pay cannot be negative']
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'processed', 'paid', 'cancelled'],
      message: 'Status must be either pending, processed, paid, or cancelled'
    }, 
    default: 'pending' 
  },
  paymentDate: {
    type: Date,
    validate: {
      validator: function(date) {
        // Payment date must be after the period it's for
        const periodDate = new Date(this.period.year, this.period.month - 1, 1);
        return !date || date >= periodDate;
      },
      message: 'Payment date must be after the payroll period'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['bank', 'cash', 'cheque', 'mobile'],
    default: 'bank'
  },
  paymentReference: {
    type: String,
    trim: true,
    maxlength: [100, 'Payment reference cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for gross pay
payrollSchema.virtual('grossPay').get(function() {
  const allowancesTotal = this.allowances.reduce((sum, a) => sum + a.amount, 0);
  return this.basicSalary + allowancesTotal + this.overtime.total + this.bonus;
});

// Virtual for total deductions
payrollSchema.virtual('totalDeductions').get(function() {
  return this.deductions.reduce((sum, d) => sum + d.amount, 0) + this.tax;
});

// Calculate values before saving
payrollSchema.pre('save', function(next) {
  // Calculate overtime total
  this.overtime.total = this.overtime.hours * this.overtime.rate;
  
  // Calculate net pay
  const grossPay = this.grossPay;
  const totalDeductions = this.totalDeductions;
  this.netPay = grossPay - totalDeductions;
  
  // Ensure net pay isn't negative
  if (this.netPay < 0) {
    throw new Error('Net pay cannot be negative. Check your deductions.');
  }
  
  next();
});

// Indexes
payrollSchema.index({ employee: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });
payrollSchema.index({ status: 1 });
payrollSchema.index({ 'period.year': 1, 'period.month': 1 });
payrollSchema.index({ paymentDate: 1 });

// Add text index for search
payrollSchema.index({
  'paymentReference': 'text',
  'notes': 'text',
  'allowances.name': 'text',
  'deductions.name': 'text'
});

// Query middleware to always populate employee details
payrollSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'fullName employeeId department position'
  }).populate({
    path: 'createdBy approvedBy',
    select: 'fullName employeeId'
  });
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);