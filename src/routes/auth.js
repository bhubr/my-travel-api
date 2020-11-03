const express = require('express');
const qs = require('querystring');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../lib/db');
const checkJwtCookie = require('../middlewares/check-jwt-cookie');
const {
  oauth: { clientId, clientSecret, redirectUri },
  jwtSecret,
} = require('../settings');

const router = express.Router();

// TODO: restrict CORS
router.get('/oauth-params', async (req, res) =>
  res.json({
    clientId,
    redirectUri,
  }),
);

async function getGitHubUser(accessToken) {
  const profileUrl = 'https://api.github.com/user';
  return axios
    .get(profileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then(response => response.data);
}

async function getUserByGitHubId(gitHubId) {
  const [user] = await db.query('SELECT id FROM user WHERE githubId = ?', [gitHubId]);
  return user;
}

async function createUser({ id: gitHubId, login, email }) {
  const userPayload = { gitHubId, login, email, role: 'user' };
  console.log('inserting', userPayload);
  await db.query('INSERT INTO user SET ?', [userPayload]);
  return getUserByGitHubId(gitHubId);
}

// TODO: restrict CORS
router.get('/access-token', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(401).json({ error: 'code is mandatory' });

  const oAuthTokenEndpoint = 'https://github.com/login/oauth/access_token';
  const codePayload = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code',
    scope: 'user:email',
  });

  try {
    const { data } = await axios.post(oAuthTokenEndpoint, codePayload);
    const responsePayload = qs.parse(data);
    if (responsePayload.error) {
      return res.status(401).json({ error: responsePayload.error });
    }
    const { access_token: accessToken } = responsePayload;
    const gitHubUser = await getGitHubUser(accessToken);
    const { id: gitHubId, login, avatar_url: avatar } = gitHubUser;
    let user = await getUserByGitHubId(gitHubId);
    if (!user) {
      user = await createUser(gitHubUser);
    }
    const jwtPayload = { ...user, gitHubId, login, avatar };
    const token = await jwt.sign(jwtPayload, jwtSecret);
    res.cookie('jwt', token, { sign: true, httpOnly: true });
    return res.json(jwtPayload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/profile', checkJwtCookie, async (req, res) => res.json(req.user));

module.exports = router;
