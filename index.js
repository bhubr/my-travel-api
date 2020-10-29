const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const slugify = require('slugify');
const _ = require('lodash');
require('dotenv').config();
const allData = require('./db.json');
const { baseUrl } = require('./settings');
const db = require('./db');

const allPhotos = [...allData.posts];

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());
app.use(morgan('dev'));

const projectIds = allPhotos.map((p) => p.id);
const nextProjectId = Math.max(...projectIds) + 1;

const NPP = 5;

const slicePhotos = (arr, page) => {
  const start = (page - 1) * NPP;
  return arr.slice(start, start + NPP);
};

app.get('/', async (req, res) => {
  res.json({
    photos: `${baseUrl}/photos`,
  });
});

const getTags = async (photos) => {
  const whereCriteria = photos.length
    ? `p.id IN (${photos.map((p) => p.id)})`
    : '0';
  const tags = await db.query(`
    SELECT t.id as id,t.name as name,pt.photoId as pid
    FROM tag t
    INNER JOIN photo_tag pt on t.id=pt.tagId
    INNER JOIN photo p on p.id=pt.photoId
    WHERE ${whereCriteria}
  `);
  const groupedTags = _.groupBy(tags, 'pid');
  return groupedTags;
};

const getAuthors = async (photos) => {
  const whereCriteria = photos.length
    ? `u.id IN (${photos.map((p) => p.authorId)})`
    : '0';
  const users = await db.query(`
    SELECT u.id, u.login FROM user u
    INNER JOIN photo p on p.authorId=u.id
    WHERE ${whereCriteria}
  `);
  const groupedUsers = _.groupBy(users, 'id');
  return groupedUsers;
};

const assignTags = (photo, allTags) => {
  const tags = allTags[photo.id] || [];
  photo.tags = tags.map(({ id, name }) => ({ id, name }));
};

const assignUser = (photo, allUsers) => {
  photo.author = allUsers[photo.authorId][0];
};

const formatPhoto = (photo) => {
  const picture = {
    small: `${baseUrl}/img/small/${photo.picture}`,
    medium: `${baseUrl}/img/medium/${photo.picture}`,
    // large: `/img/large/${photo.picture}`,
  };
  return { ...photo, picture, date: photo.date.toISOString().substr(0, 10) };
};

app.get('/photos', async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const [{ count }] = await db.query(
      'SELECT COUNT(id) AS count FROM photo WHERE approved = 1',
    );
    const records = await db.query(
      `SELECT id, authorId, title, picture, country, date FROM photo WHERE approved = 1 ORDER BY id ASC LIMIT ${
        (page - 1) * NPP
      },${NPP}`,
    );
    const results = records.map(formatPhoto);
    const tags = await getTags(results);
    const authors = await getAuthors(results);
    results.forEach((photo) => assignTags(photo, tags));
    // results.forEach((photo) => assignUser(photo, authors));
    const totalPages = Math.ceil(count / NPP);
    const next =
      page < totalPages ? `${baseUrl}/photos?page=${page + 1}` : null;
    return res.json({
      results,
      page,
      totalPages,
      totalResults: count,
      next,
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      sql: e.sql,
    });
  }
});

app.get('/photos/:idOrSlug', async (req, res) => {
  const records = await db.query(
    'SELECT id, authorId, title, picture, country, date FROM photo WHERE id = ? AND approved = 1',
    req.params.idOrSlug,
  );
  if (!records.length) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  const photo = records[0];
  const tags = await getTags(records);
  const authors = await getAuthors(records);
  assignTags(photo, tags);
  assignUser(photo, authors);
  return res.json(photo);
});

const checkApiKey = async (req, res, next) => {
  try {
    const key = req.query.apiKey || '';
    const users = await db.query('SELECT * FROM user WHERE apiKey = ?', key);
    if (!users.length) {
      return res.status(401).json({
        error:
          'Unauthorized - wrong or missing API key - provide a correct apiKey in URL parameters',
      });
    }
    req.user = users[0];
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      sql: e.sql,
    });
  }
  return next();
};

app.post('/photos', checkApiKey, async (req, res) => {
  try {
    const errors = [];
    const required = ['title', 'picture', 'country', 'date'];
    const optional = ['tags'];
    const all = [...required, ...optional];
    if (!req.body || typeof req.body !== 'object') {
      errors.push('request body is empty or not an object');
    } else {
      all.forEach((k) => {
        if (!(k in req.body) && required.includes(k)) {
          errors.push(`key '${k}' is required`);
        }
      });
      Object.keys(req.body).forEach((k) => {
        if (!all.includes(k)) {
          errors.push(`key '${k}' should not be provided`);
        }
      });
    }
    if (errors.length) {
      console.error(errors);
      return res.status(400).json({ errors });
    }
    const payload = { ...req.body, authorId: req.user.id };
    const { insertId } = await db.query('INSERT INTO photo SET ?', payload);
    const photos = await db.query('SELECT * FROM photo WHERE id = ?', insertId);
    const photo = { ...photos[0] };
    return res.json(photo);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errors: [e.message] });
  }
});

app.listen(process.env.PORT || 5099);
