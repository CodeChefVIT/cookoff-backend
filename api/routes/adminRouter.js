const express = require('express');
const {verifyAdminToken} = require('../middleware/jwtMiddleware');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.use(verifyAdminToken);
router.get('/dashboard', (req, res) => {
    res.json({ message: 'admin authorised' });
});

router.get('/getAllUsers', adminController.getAllUsers);
router.get('/enableRound/:round', adminController.enableRound);
router.get('/disableRound/:round', adminController.disableRound);
router.post('/getUserByID', adminController.getUserbyID);
router.post('/promoteUser', adminController.promoteUser);
router.post('/banUser', adminController.banUser);
router.post('/removeBan', adminController.removeBan);
router.post('/updatePassword', adminController.updatePassword);

module.exports = router;
