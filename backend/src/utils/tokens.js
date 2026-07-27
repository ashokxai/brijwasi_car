const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(payload, expiresIn = config.jwtExpiresIn) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, verifyToken };
