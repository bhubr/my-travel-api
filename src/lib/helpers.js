const _ = require('lodash');
const db = require('./db');
const { baseUrl } = require('../settings');

const getTags = async (photos) => {
  const whereCriteria = photos.length
    ? `p.id IN (${photos.map(p => p.id)})`
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
    ? `u.id IN (${photos.map(p => p.authorId)})`
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
  return {
    ...photo,
    tags: tags.map(({ name }) => name),
  };
};

const assignUser = (photo, allUsers) => ({
  ...photo,
  author: allUsers[photo.authorId][0],
});

const formatPhoto = (photo) => {
  const picture = {
    small: `${baseUrl}/img/small/${photo.picture}`,
    medium: `${baseUrl}/img/medium/${photo.picture}`,
    // large: `/img/large/${photo.picture}`,
  };
  return { ...photo, picture, date: photo.date.toISOString().substr(0, 10) };
};

const slicePhotos = (arr, page, npp) => {
  const start = (page - 1) * npp;
  return arr.slice(start, start + npp);
};

module.exports = {
  getTags,
  getAuthors,
  assignTags,
  assignUser,
  formatPhoto,
  slicePhotos,
};
