const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { baseUrl, cookieSecret } = require('./settings');
const authRouter = require('./routes/auth');
const photosRouter = require('./routes/photos');

const app = express();
app.use(cookieParser(cookieSecret));
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(morgan('dev'));

app.get('/', async (req, res) => {
  res.json({
    photos: `${baseUrl}/photos`,
  });
});

app.use('/auth', authRouter);
app.use(photosRouter);

app.listen(process.env.PORT || 5099);
