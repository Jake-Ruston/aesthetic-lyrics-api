// eslint-disable-next-line arrow-body-style
module.exports = (db, type) => {
  return db.define('artists', {
    id: {
      type: type.INTEGER,
      primaryKey: true
    },
    name: type.STRING,
    created_at: type.DATE,
    updated_at: type.DATE,
    user_id: type.INTEGER
  },
  { timestamps: false });
};
