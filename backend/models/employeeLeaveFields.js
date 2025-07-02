const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
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
}, { _id: false });

const usedLeaveSchema = new mongoose.Schema({
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
}, { _id: false });

// Export as an object to embed in other schemas
module.exports = {
  leaveBalances: leaveBalanceSchema,
  usedLeaves: usedLeaveSchema
};
