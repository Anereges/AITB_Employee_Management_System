const express = require('express')
const router = express.Router()
const Employee = require('../models/Employee').Employee

router.get('/stats', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments()
    const activeEmployees = await Employee.countDocuments({ isActive: true })
    const inactiveEmployees = totalEmployees - activeEmployees

    res.json({
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees
    })
  } catch (err) {
    console.error('Dashboard Stats Error:', err)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

module.exports = router
