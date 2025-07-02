// migrations/addLeaveFields.js
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/employee');

async function migrateLeaveFields() {
  console.log('Starting migration...');
  
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const result = await Employee.updateMany(
      { 
        $or: [
          { leaveBalances: { $exists: false } },
          { usedLeaves: { $exists: false } }
        ]
      },
      {
        $set: {
          'leaveBalances.casual': 10,
          'leaveBalances.sick': 15,
          'leaveBalances.annual': 20,
          'leaveBalances.maternity': 90,
          'leaveBalances.paternity': 5,
          'usedLeaves.casual': 0,
          'usedLeaves.sick': 0,
          'usedLeaves.annual': 0,
          'usedLeaves.maternity': 0,
          'usedLeaves.paternity': 0
        }
      }
    );

    console.log(`Migration successful. Updated ${result.nModified} documents.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateLeaveFields();