const User = require('../models/User');
const Question = require("../models/ques");
const bcrypt = require('bcrypt');

const adminController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    getUserbyID: async (req, res) => {
        const { regNo } = req.body;
        try {
            const user = await User.findOne({ regNo });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    promoteUser: async (req, res) => {
        const { regNo, round } = req.body;
        try {
            const user = await User.findOne({ regNo });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            user.roundQualified = round;
            await user.save();
            res.status(200).json({ message: `User promoted to round ${round}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    banUser: async(req, res) => {
        const { regNo } = req.body;
        try{
            const user = await User.findOne({regNo});
            if(!user) {
                return res.status(404).json({ error: 'User not found'});
            }
            user.isActive = false;
            await user.save();
            res.status(200).json({ message: `The user has been banned.`})
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    removeBan: async(req, res) => {
        const { regNo } = req.body;
        try{
            const user = await User.findOne({regNo});
            if(!user) {
                return res.status(404).json({ error: 'User not found'});
            }
            user.isActive = true;
            await user.save();
            res.status(200).json({ message: 'The user has been unbanned.'})
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    enableRound: async (req, res) => {
        const { round } = req.params;
        try {
            await Question.updateMany({ round }, { isActive: true });
            res.status(200).json({ message: `Enabled Round ${round}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    disableRound: async (req, res) => {
        const { round } = req.params;
        try {
            await Question.updateMany({ round }, { isActive: false });
            res.status(200).json({ message: `Disabled Round ${round}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    updatePassword: async(req, res) => {
        const { regNo, password } = req.body;
        try{
            const user = await User.findOne({regNo});
            if(!user) {
                return res.status(404).json({ error: 'User not found'});
            }
            const hash = await bcrypt.hash(password, 10);
            user.password = hash;
            await user.save();
            res.status(200).json({ message: 'The password has been updated.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = adminController;
