const showdown = require('showdown');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// eslint-disable-next-line arrow-parens
const readFile = relPath => {
  const filePath = path.resolve(__dirname, '../', relPath);
  return fs.readFileSync(filePath, 'utf8');
};

const writeFile = (relPath, data) => {
  const filePath = path.resolve(__dirname, '../', relPath);
  fs.writeFileSync(filePath, data);
};

const readmeTmpl = readFile('docsrc/readme.md');
const publicIndexTmpl = readFile('docsrc/index.html');

const converter = new showdown.Converter();
const readme = readmeTmpl.replace('{{baseUrl}}', process.env.BASE_URL);
const readmeHtml = converter.makeHtml(readme);
const indexHtml = publicIndexTmpl.replace('{{readme}}', readmeHtml);

writeFile('public/index.html', indexHtml);
