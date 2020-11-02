const showdown = require('showdown');
const fs = require('fs');
const path = require('path');

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
const packageJson = readFile('package.json');

const { homepage } = JSON.parse(packageJson);

const converter = new showdown.Converter();
const readme = readmeTmpl.replace('{{homepage}}', homepage);
const readmeHtml = converter.makeHtml(readme);
const indexHtml = publicIndexTmpl.replace('{{readme}}', readmeHtml);

writeFile('public/index.html', indexHtml);
