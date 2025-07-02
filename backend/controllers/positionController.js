const Position = require('../models/Position');
const { Employee } = require('../models/Employee'); // ✅ Correct way to import

// Create position
exports.createPosition = async (req, res) => {
  try {
    const { title, department, salaryRange } = req.body;

    if (!title || !department) {
      return res.status(400).json({ error: 'Title and department are required' });
    }

    const existing = await Position.findOne({ title, department });
    if (existing) {
      return res.status(400).json({ error: 'Position already exists in this department' });
    }

    const position = new Position({ title, department, salaryRange });
    await position.save();

    res.status(201).json({ message: 'Position created', position });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create position' });
  }
};

// 💥 Get all positions + count employees per position
exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find().sort({ title: 1 });

    const enrichedPositions = await Promise.all(
      positions.map(async (position) => {
        // Count how many employees have this exact position title
        const count = await Employee.countDocuments({ position: position.title });

        return {
          _id: position._id,
          title: position.title,
          department: position.department,
          salaryRange: position.salaryRange,
          employees: count // 💥 Add count
        };
      })
    );

    res.status(200).json({ data: { positions: enrichedPositions } });
  } catch (error) {
    console.error('🔥 ERROR in getPositions:', error.message);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  try {
    const { title, department, salaryRange } = req.body;
    const position = await Position.findByIdAndUpdate(
      req.params.id,
      { title, department, salaryRange },
      { new: true, runValidators: true }
    );
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    res.status(200).json({ message: 'Position updated', position });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update position' });
  }
};

// Delete position
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    res.status(200).json({ message: 'Position deleted', position });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete position' });
  }
};
