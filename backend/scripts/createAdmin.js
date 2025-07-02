require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Employee, ROLES } = require('../models/Employee');
const Department = require('../models/Department'); // Adjust path if needed

// Admin data without employeeId to allow auto-generation
const adminData = {
  fullName: 'Amanuel Sisay',
  username: 'admin_12',
  email: 'amanuelsisay@gmail.com',
  phone: '0934567890',
  password: 'Sigma$123', // Plain password to be hashed
  role: ROLES.ADMIN,
  isActive: true,
  isSelfRegistered: false,
  registrationStatus: 'approved',
  position: 'System Administrator',
  sex: 'Male'
};

async function createAdmin() {
  try {
    console.log('Using MONGO_URI:', process.env.MONGO_URI);

    // Connect to MongoDB without deprecated options
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    console.log('✅ MongoDB connection established');

    // Find or create the department
    let department = await Department.findOne({ name: 'Information Technology' });
    if (!department) {
      console.log('Department "Information Technology" not found. Creating...');
      department = await Department.create({
        name: 'Information Technology',
        description: 'IT department'
      });
      console.log('Department created:', department._id.toString());
    } else {
      console.log('Department found:', department._id.toString());
    }

    // Attach department ObjectId to adminData
    adminData.department = department._id;

    // Check if admin already exists by email or username
    const existingAdmin = await Employee.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️ Admin account already exists:');
      console.log('- Email:', existingAdmin.email);
      console.log('- Username:', existingAdmin.username);
      await mongoose.disconnect();
      return process.exit(0);
    }

    // Hash the password before saving
    adminData.password = await bcrypt.hash(adminData.password, 12);
    console.log('🔑 Password hashed successfully');

    // Create new admin employee
    const newAdmin = await Employee.create({
      ...adminData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('\n🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY');
    console.log('==================================');
    console.log('👤 Name:', newAdmin.fullName);
    console.log('📧 Email:', newAdmin.email);
    console.log('👔 Role:', newAdmin.role);
    console.log('🆔 Employee ID:', newAdmin.employeeId);
    console.log('🏢 Department ID:', newAdmin.department.toString());
    console.log('🔑 Password:', 'Sigma#123 (change this immediately)');
    console.log('==================================\n');

    // Disconnect from MongoDB cleanly
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR CREATING ADMIN ACCOUNT');
    console.error('==================================');
    console.error('Error:', error.message);

    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\nMissing dependencies. Run: npm install mongoose bcryptjs dotenv');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('\nMongoDB connection failed. Ensure:');
      console.error('- MongoDB service is running');
      console.error('- Connection string is correct in .env file');
      console.error('- No firewall blocking port 27017');
    }

    console.error('==================================\n');
    process.exit(1);
  }
}

// Run the script
createAdmin();
