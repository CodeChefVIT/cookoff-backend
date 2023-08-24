const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/jwtMiddleware');
const router = express.Router();
const key = 'abcd'

router.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: 'authorised' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: 'User is disabled' });
        }
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.regNo }, key, { expiresIn: '1h' });
            res.header('Authorization', `Bearer ${token}`);
            res.json(token);
        } 
        else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    } 
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
  
router.post('/signup', async (req, res) => {
    try {
        const { name, regNo, email, password } = req.body;
        const user_exists = await User.findOne({ $or: [{ regNo }, { email }] });
        if(user_exists) {
            return res.status(400).json({ error: 'User with the same registration number or email already exists' });
        }
        const hash = await bcrypt.hash(password, 10); 
        const new_user = new User({ name, regNo, email, password: hash });
        await new_user.save();
        res.status(201).json({ message: 'Signup successful' });
    } 
    catch(error) {
        res.status(400).json({ error: 'Error' });
    }
});

module.exports = router;