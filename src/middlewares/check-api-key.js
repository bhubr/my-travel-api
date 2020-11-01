const db = require('../lib/db');

const checkApiKey = async (req, res, next) => {
  try {
    const key = req.query.apiKey || '';
    const [user] = await db.query('SELECT * FROM user WHERE apiKey = ?', key);
    if (!user) {
      return res.status(401).json({
        error:
          'Unauthorized - wrong or missing API key - provide a correct apiKey in URL parameters',
      });
    }
    req.user = user;
    return next();
  } catch (e) {
    return res.status(500).json({
      error: e.message,
      sql: e.sql,
    });
  }
};

module.exports = checkApiKey;
