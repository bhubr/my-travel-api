const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const slugify = require('slugify');
const fs = require('fs');
const allData = require('./db.json');

const allPhotos = [...allData.posts];

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

const projectIds = allPhotos.map(p => p.id);
let nextProjectId = Math.max(...projectIds) + 1;

const baseUrl = 'https://travel-api.jsx.fr';
const NPP = 10;

const slicePhotos = (arr, page) => {
  const start = (page - 1) * NPP;
  return arr.slice(start, start + NPP);
}

app.get('/photos', (req, res) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const results = slicePhotos(allPhotos, page);
  const totalPages = Math.ceil(allPhotos.length / NPP);
  const totalResults = allPhotos.length;
  const next = page < totalPages ? `${baseUrl}/photos?page=${page + 1}` : null;
  res.json({
    results, page, totalPages, totalResults, next
  });
});

app.get('/photos/:idOrSlug', (req, res) => {
  const project = allPhotos.find(
    p => p.id === Number(req.params.idOrSlug) || p.slug === req.params.idOrSlug
  );
  if (!project) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  return res.json(project);
});

app.post('/photos', (req, res) => {
  try {
    const errors = [];
    const required = ['title', 'link', 'repo', 'picture', 'promo', 'type'];
    const optional = ['description', 'techno'];
    const all = [...required, ...optional];
    if (!req.body || typeof req.body !== 'object') {
      errors.push('request body is empty or not an object');
    } else {
      all.forEach(k => {
        if (!(k in req.body) && required.includes(k)) {
          errors.push(`key '${k}' is required`);
        }
      });
      Object.keys(req.body).forEach(k => {
        if (!all.includes(k)) {
          errors.push(`key '${k}' should not be provided`);
        }
      });
    }
    if (errors.length) {
      console.error(errors);
      return res.status(400).json({ errors });
    }
    const slug = slugify(req.body.title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
    const date = new Date().toISOString();
    const newProject = { ...req.body, id: nextProjectId, slug, date };
    nextProjectId += 1;
    allPhotos.push(newProject);
    fs.writeFile('portfolio-projects-db.json', JSON.stringify(allPhotos, null, 2), (err) => {
      if (err) return res.status(500).json({ errors: [err.message] });
      return res.json(newProject);
    });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ errors: [e.message] });
  }
});

app.listen(process.env.PORT || 5095);

