const express = require('express');
const qs = require('querystring');
const axios = require('axios');
const checkJwtCookie = require('../middlewares/check-jwt-cookie');
const {
  oauth: { clientId, clientSecret, redirectUri },
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

// TODO: restrict CORS
router.get('/access-token', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(401).json({ error: 'code is mandatory' });

  const oAuthTokenEndpoint = 'https://github.com/login/oauth/access_token';
  const payload = qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code',
  });

  try {
    const { data } = await axios.post(oAuthTokenEndpoint, payload);
    const responsePayload = qs.parse(data);
    if (responsePayload.error) {
      return res.status(401).json({ error: responsePayload.error });
    }
    console.log(responsePayload);
    const { access_token: accessToken } = responsePayload;
    const user = await getGitHubUser(accessToken);
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/profile', checkJwtCookie, async (req, res) => {});

module.exports = router;
