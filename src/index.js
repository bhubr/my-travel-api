const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { baseUrl } = require('./settings');
const photosRouter = require('./routes/photos');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());
app.use(morgan('dev'));

app.get('/', async (req, res) => {
  res.json({
    photos: `${baseUrl}/photos`,
  });
});

app.use(photosRouter);

app.listen(process.env.PORT || 5099);
