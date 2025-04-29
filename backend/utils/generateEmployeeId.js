const Employee = require('../models/Employee');

const generateEmployeeId = async () => {
  let employeeId;

  // Keep generating a new ID until it is unique
  do {
    employeeId = 'EMP-' + Math.floor(100000 + Math.random() * 900000);
    const existingEmployee = await Employee.findOne({ employeeId });

    // If the ID already exists, generate a new one
    if (!existingEmployee) {
      break; // Break out of the loop if the ID is unique
    }
  } while (true);

  return employeeId;
};

module.exports = generateEmployeeId;