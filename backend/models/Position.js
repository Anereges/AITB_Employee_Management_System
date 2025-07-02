const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  salaryRange: { type: String }
});

module.exports = mongoose.model('Position', positionSchema);
