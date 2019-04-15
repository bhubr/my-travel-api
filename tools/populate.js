const Promise = require('bluebird');
const { posts } = require('../db.json');
const db = require('../db');

const getPicture = ({ medium }) => medium.split('/').pop();

const getTagRecord = async tagName => db.query(
  'SELECT * FROM `tag` WHERE name = ?', tagName
)
  .then(records => (records.length ? records[0] : null));

Promise.reduce(
  posts,
  async (carry, {
    title, picture, tags, country, date
  }) => {
    const payload = {
      title,
      picture: getPicture(picture),
      country,
      date
    };
    // console.log(payload);
    const { insertId: photoId } = await db.query('INSERT INTO photo SET ?', payload);
    // console.log('inserted photo with id', resultId);
    const tagIds = [];
    await Promise.reduce(
      tags,
      async (carry, tagName) => {
        const tagRecord = await getTagRecord(tagName);
        if (tagRecord) {
          tagIds.push(tagRecord.id);
          return false;
        }
        const { insertId } = await db.query('INSERT INTO tag SET ?', { name: tagName });
        tagIds.push(insertId);
        return true;
      },
      []
    )
      .catch(err => { console.error('ERR', err); throw err; });
    await Promise.map(
      tagIds,
      tagId => db.query('INSERT INTO photo_tag SET ?', { photoId, tagId })
    )
    .catch(err => { console.error('ERR', err); throw err; });
  }
)
  .then(() => process.exit());