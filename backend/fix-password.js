const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function fixAdminUser() {
  const uri = 'mongodb://localhost:27017/employeeDB'; // Change if your port is different
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    // Delete existing admin if needed (optional)
    await users.deleteOne({ email: 'admin@example.com' });

    // Hash the password properly
    const saltRounds = 10;
    const plainPassword = 'AmanuelAdmin@19';
    const hash = await bcrypt.hash(plainPassword, saltRounds);

    // Insert new user
    await users.insertOne({
      fullName: 'amannel_sisay',
      username: 'admin_19',
      email: 'admin@example.com',
      phone: '0934567890',
      password: hash,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully!');
  } finally {
    await client.close();
  }
}

fixAdminUser().catch(console.error);