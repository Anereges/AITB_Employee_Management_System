const Department = require('../models/Department');

// Create Department
exports.createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Validation
        if (!name) {
            return res.status(400).json({ error: "Department name is required" });
        }

        // Check if department already exists
        const existingDept = await Department.findOne({ name });
        if (existingDept) {
            return res.status(400).json({ error: "Department already exists" });
        }

        const department = new Department({ name, description });
        await department.save();
        
        res.status(201).json({
            message: "Department created successfully",
            department
        });

    } catch (error) {
        console.error("Error creating department:", error);
        res.status(500).json({ 
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
        const department = await Department.findByIdAndDelete(req.params.id);
        
        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }

        // Check if department has employees before deleting
        const Employee = require('../models/Employee');
        const employeesInDept = await Employee.countDocuments({ department: req.params.id });
        
        if (employeesInDept > 0) {
            return res.status(400).json({ 
                error: "Cannot delete department with assigned employees",
                employeeCount: employeesInDept
            });
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