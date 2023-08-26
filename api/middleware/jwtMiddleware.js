const jwt = require('jsonwebtoken');
require("dotenv").config();
const key = process.env.ACCESS_KEY_SECRET;

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, key);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
}

module.exports = verifyToken;