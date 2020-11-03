/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-amd */
/* eslint-disable import/no-dynamic-require */
require.config({
  paths: {
    bootstrap: '../docs/vendor/bootstrap.min',
    handlebars: '../docs/vendor/handlebars.min',
    jquery: '../docs/vendor/jquery.min',
    prismjs: '../docs/vendor/prism',
  },
  shim: {
    bootstrap: {
      deps: ['jquery'],
    },
    handlebars: {
      exports: 'Handlebars',
    },
    prismjs: {
      exports: 'Prism',
    },
  },
  urlArgs: `v=${new Date().getTime()}`,
  waitSeconds: 150,
});

async function checkProfile() {
  return fetch('/auth/profile', {
    credentials: 'include',
  })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('401 Unauthorized');
        }
        throw new Error('Could not get profile');
      }
      return res.json();
    })
    .then(profile => [null, profile])
    .catch(err => [err, null]);
}

async function getOAuthParams() {
  return fetch('/auth/oauth-params').then(res => {
    if (!res.ok) {
      console.error(res.status);
      throw new Error('Could not get params');
    }
    return res.json();
  });
}

async function requestAccessToken(code) {
  return fetch(`/auth/access-token?code=${code}`, {
    credentials: 'include',
  }).then(res => {
    if (!res.ok) {
      console.error(res.status);
      throw new Error('Could not get access token');
    }
    return res.json();
  });
}

/*
 * Create form to request access token from GitHub's OAuth 2.0 server.
 */
async function oauthSignIn() {
  // Request OAuth params from server
  try {
    const oAuthParams = await getOAuthParams();
    // Google's OAuth 2.0 endpoint for requesting an access token
    const oauth2Endpoint = 'https://github.com/login/oauth/authorize';

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    const form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    const { clientId, redirectUri } = oAuthParams;
    const params = {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'user:email',
      state: 'pass-through value',
    };

    // Add form parameters as hidden input values.
    Object.keys(params).forEach(p => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    });

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    console.error('an error occurred', err);
  }
}

function getCodeFromLocationQuery() {
  const { search } = window.location;
  if (!search) return null;
  const tokenRegExp = /code=([^&]+)/;
  const matches = search.match(tokenRegExp);
  return matches && matches[1];
}

async function checkOAuthCode() {
  const oAuthCode = getCodeFromLocationQuery();
  // No error, no code
  if (!oAuthCode) return [null, null];

  history.pushState(null, '', '/');
  return requestAccessToken(oAuthCode)
    .then(profile => [null, profile])
    .catch(err => [err, null]);
}

/**
 * Verify authentication
 *
 * 1. check if we're getting an OAuth code => request JWT
 * 2. if we're not, check profile
 *
 * @returns {boolean} user data if we're authenticated, null otherwise
 */
async function getAuthStatus() {
  console.log('checking oauth code...');
  const [errCode, profile1] = await checkOAuthCode();
  if (errCode || profile1) return [errCode, profile1];

  console.log('checking profile...');
  const [errProfile, profile2] = await checkProfile();
  if (errProfile && errProfile.message === '401 Unauthorized') {
    return [null, null];
  }
  return [errProfile, profile2];
}

async function initHome($, Handlebars, Prism) {
  const templateNavbarGuest = Handlebars.compile($('#template-navbar-guest').html());
  const templateNavbarUser = Handlebars.compile($('#template-navbar-user').html());
  const templateAlert = Handlebars.compile($('#template-alert').html());

  function displayAlert(status, message) {
    const html = templateAlert({ status, message });
    $('#alert').html(html).show();
  }

  const [errAuth, profile] = await getAuthStatus();
  if (errAuth) {
    displayAlert('danger', errAuth.message);
  } else if (profile) {
    $('#navbar-right').html(templateNavbarUser(profile));
  } else {
    $('#navbar-right').html(templateNavbarGuest({}));
    $('#signin').click(oauthSignIn);
  }
  $('#main').removeClass('main-hidden');
  $('#loader').hide();
}

require(['jquery', 'handlebars', 'prismjs', 'bootstrap'], ($, Handlebars, Prism) => {
  initHome($, Handlebars, Prism);
});
