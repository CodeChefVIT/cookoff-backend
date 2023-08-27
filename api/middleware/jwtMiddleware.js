const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require('../models/User')

async function verifyAccessToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_KEY_SECRET);
        const user = await User.findOne({ regNo: decoded.regNo });
        if(!user || user.tokenVersion !== decoded.tokenVersion){
            return res.status(403).json({message: 'Unauthorized'});
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
}

async function verifyRefreshToken(req, res, next) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'refreshToken is required' });
    }
    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(404).json({ message: 'Please login again.' });
        }
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refreshToken' });
        }
        jwt.verify(refreshToken, process.env.REFRESH_KEY_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'refreshToken expired' });
            }
            console.log(decoded);
            req.user = user;
            next();
        
        });
    } 
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    verifyAccessToken,
    verifyRefreshToken
};
