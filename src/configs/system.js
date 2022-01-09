const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    jwtSecretKey: process.env.JWT_SECRET,
    jwtExpiry: 60 * 60 * 60 // 60 hours
}