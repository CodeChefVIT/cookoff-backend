const express = require('express');
const verifyToken = require('../middleware/jwtMiddleware');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: 'authorised' });
});

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh', authController.refresh);

module.exports = router;