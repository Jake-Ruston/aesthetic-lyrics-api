// eslint-disable-next-line arrow-body-style
module.exports = (db, type) => {
  return db.define('users', {
    id: {
      type: type.INTEGER,
      primaryKey: true
    },
    username: type.STRING,
    password: type.STRING,
    token: type.STRING,
    created_at: type.DATE,
    updated_at: type.DATE
  },
  { timestamps: false });
};
