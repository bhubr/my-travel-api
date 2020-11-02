const mysql = process.env.CLEARDB_DATABASE_URL || {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
};

module.exports = {
  baseUrl: process.env.BASE_URL,
  cookieSecret: process.env.COOKIE_SECRET || 'Cookie::Secret',
  jwtSecret: process.env.JWT_SECRET || 'JWT::Secret',
  mysql,
  npp: 5,
};
