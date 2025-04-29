const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const generateToken = (employee) => {
  return jwt.sign(
    {
      id: employee._id,
      email: employee.email,
      role: employee.role
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );
};

exports.registerEmployee = async (req, res) => {
  try {
    // Destructure all required fields from request body
    const {
      fullName,
      username,
      email,
      phone,
      password,
      confirmPassword,
      role,
      department,
      position,
      companyName,
      salary,
      hireDate
    } = req.body;

    // Validate all required fields
    const requiredFields = {
      fullName,
      username,
      email,
      phone,
      password,
      confirmPassword,
      role,
      department,
      position,
      companyName,
      salary,
      hireDate
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        missingFields
      });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check for existing user
    const existingUser = await Employee.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new employee
    const employee = new Employee({
      employeeId: `EMP-${Date.now()}`,
      fullName,
      username,
      email,
      phone,
      password,
      role,
      department,
      position,
      companyName,
      salary: Number(salary),
      hireDate: new Date(hireDate),
      profileImage: req.file?.path || ''
    });

    // Hash password (using pre-save hook in model)
    await employee.save();

    // Generate JWT token
    const token = generateToken(employee);

    // Successful response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      employee: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        position: employee.position,
        companyName: employee.companyName
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find employee with password
    const employee = await Employee.findOne({ email }).select('+password');
    
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, employee.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(employee);

    // Successful login response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        position: employee.position
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};