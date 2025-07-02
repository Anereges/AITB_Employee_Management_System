const express = require('express')
const router = express.Router()
const Employee = require('../models/Employee').Employee

// Dummy activity data — replace with real logic if you have logs
router.get('/recent', async (req, res) => {
  try {
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email hireDate')

    const activities = recentEmployees.map(emp => ({
      message: `${emp.fullName} was hired`,
      date: emp.hireDate
    }))

    res.json(activities)
  } catch (err) {
    console.error('Activity Fetch Error:', err)
    res.status(500).json({ error: 'Failed to load recent activity' })
  }
})

module.exports = router
