const jwt = require('jsonwebtoken');
require("dotenv").config();
const accessTokenSecret = process.env.ACCESS_KEY_SECRET;
const refreshTokenSecret = process.env.REFRESH_KEY_SECRET;

const jwtController = {
    signAccessToken: (regNo, userRole, tokenVersion) => {
        const payload = { regNo: regNo, userRole: userRole, tokenVersion: tokenVersion };
        return jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' });
    },
    
    signRefreshToken: (regNo, userRole) => {
        const payload = { regNo: regNo, userRole: userRole };
        return jwt.sign(payload, refreshTokenSecret, { expiresIn: '1d' });
    }
};

module.exports = jwtController;