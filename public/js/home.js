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
  urlArgs: 'v=' + new Date().getTime(),
  waitSeconds: 150,
});

function checkProfile() {
  return fetch('/auth/profile').then(res => {
    if (!res.ok) {
      console.error(res.status);
      throw new Error('Could not get profile');
    }
    return res.json();
  });
}

function init($, Handlebars, Prism) {
  const templateNavbarGuest = Handlebars.compile($('#template-navbar-guest').html());
  const templateNavbarUser = Handlebars.compile($('#template-navbar-user').html());

  checkProfile()
    .then(profile => {
      console.log('logged in');
      $('#navbar-right').html(templateNavbarUser);
    })
    .catch(err => {
      console.log('not logged in', err);
      $('#navbar-right').html(templateNavbarGuest);
    })
    .finally(() => {
      $('#main').removeClass('main-hidden');
      $('#loader').hide();
    });
}

require(['jquery', 'handlebars', 'prismjs', 'bootstrap'], (
  $,
  Handlebars,
  Prism,
  bootstrap,
) => {
  init($, Handlebars, Prism);
});
