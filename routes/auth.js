const express = require('express');
const router = express.Router()

const authController = require('../controller/auth');
router.post('/sign-up', authController.signUp)
router.post('/sign-in', authController.signIn)
router.post('/recover-password', authController.resetPassword)
router.post('/recover-password/check', authController.checkPasswordRecoveryValidaty)
router.post('/recover-password/new-password', authController.setNewPassword)
module.exports = router;