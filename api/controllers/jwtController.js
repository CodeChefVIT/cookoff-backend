const jwt = require('jsonwebtoken');
const accessTokenSecret = 'abcd';
const refreshTokenSecret = 'defg';

const jwtController = {
    signAccessToken: (regNo) => {
        const payload = { regNo: regNo };
        return jwt.sign(payload, accessTokenSecret, { expiresIn: '15s' });
    },
    
    signRefreshToken: (regNo) => {
        const payload = { regNo: regNo };
        return jwt.sign(payload, refreshTokenSecret, { expiresIn: '1d' });
    },
    
    verifyAccessToken: (token) => {
        try {
            return jwt.verify(token, accessTokenSecret);
        } 
        catch (error) {
            throw new Error('Invalid access token');
        }
    },
    
    verifyRefreshToken: (token) => {
        try {
            return jwt.verify(token, refreshTokenSecret);
        } 
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
};

module.exports = jwtController;