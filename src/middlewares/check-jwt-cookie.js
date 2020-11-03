const expressJwt = require('express-jwt');
const { jwtSecret } = require('../settings');

const checkJwtCookie = expressJwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
  credentialsRequired: true,
  getToken: req => {
    const { headers, cookies } = req;
    console.log(headers, cookies);
    if (headers.authorization && headers.authorization.split(' ')[0] === 'Bearer') {
      return headers.authorization.split(' ')[1];
    }
    if (cookies && cookies.jwt) {
      return cookies.jwt;
    }
    return null;
  },
});

module.exports = checkJwtCookie;
