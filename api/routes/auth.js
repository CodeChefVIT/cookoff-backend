const express = require('express');
const {verifyRefreshToken, verifyAccessToken} = require('../middleware/jwtMiddleware');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/dashboard', verifyAccessToken, (req, res) => {
    res.json({ message: 'authorised' });
});

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh', verifyRefreshToken, authController.refresh);
router.post('/logout', verifyAccessToken, authController.logout);

module.exports = router;