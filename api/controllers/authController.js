const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwtController = require('../controllers/jwtController');

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            if (!user.isActive) {
                return res.status(403).json({ message: 'User is banned' });
            }
            if (await bcrypt.compare(password, user.password)) {
                user.tokenVersion += 1;
                await user.save();
                const accessToken = jwtController.signAccessToken(user.regNo, user.userRole, user.tokenVersion);
                const refreshToken = jwtController.signRefreshToken(user.regNo, user.userRole);
                user.refreshToken = refreshToken;
                await user.save();
                res.header('Authorization', `Bearer ${accessToken}`);
                res.json({ accessToken, refreshToken });
            } else {
                res.status(401).json({ message: 'Incorrect password' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    signup: async (req, res) => {
        try {
            const { name, regNo, email, password } = req.body;
            const user_exists = await User.findOne({ $or: [{ regNo }, { email }] });
            if (user_exists) {
                return res.status(400).json({ error: 'User with the same registration number or email already exists' });
            }
            const hash = await bcrypt.hash(password, 10);
            const new_user = new User({ name, regNo, email, password: hash });
            await new_user.save();
            res.status(201).json({ message: 'Signup successful' });
        } catch (error) {
            res.status(400).json({ error: 'Error' });
        }
    },

    dashboard: async (req, res) => {
        try {
            const decoded = req.user;
            const user = await User.findOne({ regNo: decoded.regNo });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: 'Error' });
        }
    },

    refresh: async (req, res) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'refreshToken is required' });
        }
        try {
            const user = await User.findOne({ refreshToken });
            if (!user) {
                return res.status(404).json({ message: 'Invalid refreshToken' });
            }
            const storedRefreshToken = user.refreshToken;
            if (!storedRefreshToken) {
                return res.status(400).json({ message: 'Invalid refreshToken' });
            }
            user.tokenVersion += 1;
            await user.save();
            const newAccessToken = jwtController.signAccessToken(user.regNo, user.userRole, user.tokenVersion);
            res.header('Authorization', `Bearer ${newAccessToken}`);
            res.json({ accessToken: newAccessToken });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    logout: async (req, res) => {
        try {
            const decoded = req.user;
            const user = await User.findOne({ regNo: decoded.regNo });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            user.tokenVersion = 0;
            user.refreshToken = null;
            await user.save();
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    },

};

module.exports = authController;