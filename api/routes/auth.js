const express = require('express');
const {verifyRefreshToken, verifyAccessToken, verifyAdminToken} = require('../middleware/jwtMiddleware');
const RateLimiter =  require('../middleware/rateLimit')
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/dashboard', verifyAccessToken, (req, res) => {
    res.json({ message: 'authorised' });
});

router.get('/admin', verifyAdminToken, (req, res) => {
    res.json({ message: 'admin authorised' });
});

router.post('/login', RateLimiter, authController.login);
router.post('/signup', authController.signup);
router.post('/refresh', RateLimiter, verifyRefreshToken, authController.refresh);
router.post('/logout', verifyAccessToken, authController.logout);

module.exports = router;