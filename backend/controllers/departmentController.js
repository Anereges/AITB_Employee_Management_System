const { Employee } = require('../models/Employee');
const Department = require('../models/Department');


// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    console.log('Received createDepartment request with:', { name, description });

    // Trim inputs to avoid whitespace issues
    const trimmedName = name?.trim();
    const trimmedDescription = description?.trim() || '';

    // Validation
    if (!trimmedName) {
      console.log('Validation failed: Department name is required');
      return res.status(400).json({ error: "Department name is required" });
    }

    // Check if department already exists
    const existingDept = await Department.findOne({ name: trimmedName });
    if (existingDept) {
      console.log(`Department already exists: ${trimmedName}`);
      return res.status(400).json({ error: "Department already exists" });
    }

    // Create and save new department
    const department = new Department({ name: trimmedName, description: trimmedDescription });
    await department.save();

    console.log('Department created successfully:', department);

    return res.status(201).json({
      message: "Department created successfully",
      department
    });

  } catch (error) {
    console.error("Error creating department:", error);
    return res.status(500).json({
      error: "Failed to create department",
      details: error.message
    });
  }
};


// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      error: "Failed to fetch departments",
      details: error.message
    });
  }
};

// Get single department
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.status(200).json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({
      error: "Failed to fetch department",
      details: error.message
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      department
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({
      error: "Failed to update department",
      details: error.message
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    // Check if department has employees before deleting
    const employeesInDept = await Employee.countDocuments({ department: req.params.id });

    if (employeesInDept > 0) {
      return res.status(400).json({
        error: "Cannot delete department with assigned employees",
        employeeCount: employeesInDept
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department deleted successfully",
      deletedDepartment: department
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({
      error: "Failed to delete department",
      details: error.message
    });
  }
};

// Get department statistics
exports.getDepartmentStats = async (req, res) => {
  try {
    // Get total departments count
    const totalDepartments = await Department.countDocuments();
    
    // Get total employees count
    const totalEmployees = await Employee.countDocuments();
    
    // Get employee count per department with department details
    const departmentsWithStats = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'department',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          manager: 1,
          employeesCount: { $size: '$employees' },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDepartments,
        totalEmployees,
        departments: departmentsWithStats
      }
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch department statistics",
      details: error.message
    });
  }
};
