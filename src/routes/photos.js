const express = require('express');
const { baseUrl, npp } = require('../settings');
const db = require('../lib/db');
const {
  getAuthors,
  getTags,
  assignUser,
  assignTags,
  formatPhoto,
} = require('../lib/helpers');
const checkApiKey = require('../middlewares/check-api-key');

const router = express.Router();

const getPageUrl = page => `${baseUrl}/photos?page=${page + 1}`;

router.get('/photos', async (req, res) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const [{ count }] = await db.query(
      'SELECT COUNT(id) AS count FROM photo WHERE approved = 1',
    );
    const records = await db.query(
      `SELECT id, authorId, title, picture, country, date FROM photo WHERE approved = 1 ORDER BY id ASC LIMIT ${
        (page - 1) * npp
      },${npp}`,
    );
    const results = records.map(formatPhoto);
    const tags = await getTags(results);
    // const authors = await getAuthors(results);
    results.forEach(photo => assignTags(photo, tags));
    // results.forEach((photo) => assignUser(photo, authors));
    const totalPages = Math.ceil(count / npp);
    const next = page < totalPages ? getPageUrl(page) : null;
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

/**
 * @api {get} /photos/:idOrSlug Request single Photo information
 * @apiName GetSinglePhoto
 * @apiGroup Photo
 *
 * @apiParam {any} idOrSlug Photo's unique ID or slug.
 *
 * @apiSuccess {Number} id Unique ID of the Photo.
 * @apiSuccess {String} country Country where the Photo was taken.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "country": "Mexico"
 *     }
 *
 * @apiError PhotoNotFound The id of the Photo was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "PhotoNotFound"
 *     }
 */
router.get('/photos/:idOrSlug', async (req, res) => {
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

router.post('/photos', checkApiKey, async (req, res) => {
  try {
    const errors = [];
    const required = ['title', 'picture', 'country', 'date'];
    const optional = ['tags'];
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

module.exports = router;
