const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');
const generateEmployeeId = require('../utils/generateEmployeeId');

// Register Employee
const registerEmployee = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            username,
            password,
            confirmPassword,
            companyName,
            role,
            department,
            position,
            salary,
            hireDate,
        } = req.body;

        // Generate unique Employee ID
        const employeeId = await generateEmployeeId();

        const profileImage = req.file ? req.file.filename : null;

        // Validation
        const requiredFields = ['fullName', 'email', 'username', 'password', 'phone', 'companyName', 'role'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                missingFields 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Check for existing employee
        const existingEmployee = await Employee.findOne({ $or: [{ email }, { username }] });
        if (existingEmployee) {
            return res.status(400).json({ 
                message: 'Employee with this email or username already exists',
                conflict: existingEmployee.email === email ? 'email' : 'username'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new employee
        const newEmployee = new Employee({
            employeeId,
            fullName,
            email,
            phone,
            username,
            password: hashedPassword,
            companyName,
            role,
            department,
            position,
            salary: parseFloat(salary),
            hireDate: hireDate || new Date(),
            profileImage,
        });

        await newEmployee.save();

        // Remove password from response
        const employeeResponse = newEmployee.toObject();
        delete employeeResponse.password;

        res.status(201).json({
            message: 'Employee registered successfully',
            employee: employeeResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Delete uploaded file if error occurred
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            message: 'Failed to register employee',
            error: error.message 
        });
    }
};

// Login Employee
const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const employee = await Employee.findOne({ email }).select('+password');
        if (!employee) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: employee._id, 
                role: employee.role, 
                username: employee.username,
                employeeId: employee.employeeId
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove sensitive data
        employee.password = undefined;

        res.status(200).json({
            message: 'Login successful',
            token,
            expiresIn: 86400, // 1 day in seconds
            employee
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: error.message 
        });
    }
};

// Get All Employees (with pagination and filtering)
const getAllEmployees = async (req, res) => {
    try {
        const { page = 1, limit = 10, department, role } = req.query;
        const filter = {};
        
        if (department) filter.department = department;
        if (role) filter.role = role;

        const employees = await Employee.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ fullName: 1 });

        const count = await Employee.countDocuments(filter);

        res.status(200).json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            employees
        });
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ 
            message: 'Error fetching employees',
            error: error.message 
        });
    }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ 
            message: 'Error fetching employee',
            error: error.message 
        });
    }
};

// Update Employee
const updateEmployee = async (req, res) => {
    try {
        const updates = req.body;
        
        // Remove restricted fields
        delete updates.password;
        delete updates.employeeId;
        delete updates._id;

        if (req.file) {
            updates.profileImage = req.file.filename;
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Delete old profile image if new one was uploaded
        if (req.file && employee.profileImage !== req.file.filename) {
            const oldImagePath = path.join(__dirname, '../uploads', employee.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        res.status(200).json({
            message: 'Employee updated successfully',
            employee
        });
    } catch (error) {
        console.error('Update error:', error);
        
        // Delete uploaded file if error occurred
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ 
            message: 'Failed to update employee',
            error: error.message 
        });
    }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Delete profile image if exists
        if (employee.profileImage) {
            const imagePath = path.join(__dirname, '../uploads', employee.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.status(200).json({ 
            message: 'Employee deleted successfully',
            deletedEmployee: employee 
        });
    } catch (error) {
        console.error('Deletion error:', error);
        res.status(500).json({ 
            message: 'Failed to delete employee',
            error: error.message 
        });
    }
};

module.exports = {
    registerEmployee,
    loginEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};