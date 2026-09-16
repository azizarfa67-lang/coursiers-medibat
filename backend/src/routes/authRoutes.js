// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerCoursier, loginCoursier, loginAdmin, refreshToken } = require('../controllers/authController');

router.post('/coursier/register', registerCoursier);
router.post('/coursier/login', loginCoursier);
router.post('/admin/login', loginAdmin);
router.post('/refresh-token', refreshToken);

module.exports = router;
