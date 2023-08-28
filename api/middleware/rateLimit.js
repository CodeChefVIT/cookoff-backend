const rateLimit = require('express-rate-limit');

const RateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});

module.exports = RateLimiter;