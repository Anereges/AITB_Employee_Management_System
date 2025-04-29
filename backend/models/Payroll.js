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
      required: true, 
      min: 1, 
      max: 12 
    },
    year: { 
      type: Number, 
      required: true, 
      min: 2000 
    }
  },
  basicSalary: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  allowances: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  deductions: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: String
  }],
  overtime: {
    hours: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  tax: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processed', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  paymentDate: Date,
  notes: String
}, { timestamps: true });

// Calculate net pay before saving
payrollSchema.pre('save', function(next) {
  const allowancesTotal = this.allowances.reduce((sum, a) => sum + a.amount, 0);
  const deductionsTotal = this.deductions.reduce((sum, d) => sum + d.amount, 0);
  this.overtime.total = this.overtine.hours * this.overtime.rate;
  
  this.netPay = this.basicSalary + allowancesTotal + this.overtime.total - deductionsTotal - this.tax;
  next();
});

// Index for faster queries
payrollSchema.index({ employee: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);