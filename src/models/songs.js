// eslint-disable-next-line arrow-body-style
module.exports = (db, type) => {
  return db.define('songs', {
    id: {
      type: type.INTEGER,
      primaryKey: true
    },
    name: type.STRING,
    lyrics: type.TEXT,
    created_at: type.DATE,
    updated_at: type.DATE,
    user_id: type.INTEGER,
    artist_id: type.INTEGER,
    album_id: type.INTEGER
  },
  { timestamps: false });
};
