const expressJwt = require('express-jwt');
const { jwtSecret } = require('../settings');

const checkJwtCookie = expressJwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
  credentialsRequired: true,
  getToken: req => {
    const { headers, cookie } = req;
    if (headers.authorization && headers.authorization.split(' ')[0] === 'Bearer') {
      return headers.authorization.split(' ')[1];
    }
    if (cookie && cookie.jwt) {
      return cookie.jwt;
    }
    return null;
  },
});

module.exports = checkJwtCookie;
