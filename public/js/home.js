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

function init($, Handlebars, Prism) {
  const templateNavbarGuest = Handlebars.compile($('#template-navbar-guest').html());
  const templateNavbarUser = Handlebars.compile($('#template-navbar-user').html());
  $('#main').removeClass('main-hidden');
  $('#loader').hide();
  $('#navbar-right').html(templateNavbarGuest);
}

require(['jquery', 'handlebars', 'prismjs', , 'bootstrap'], (
  $,
  Handlebars,
  Prism,
  bootstrap,
) => {
  init($, Handlebars, Prism);
});
