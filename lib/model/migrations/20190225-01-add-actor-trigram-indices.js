module.exports = {
  up: (db) => {
    db.raw(`create extension if not exists pg_trgm`);
    db.raw(`create index actors_displayname_gist_index on actors using gist ("displayName" gist_trgm_ops)`);
    db.raw(`create index users_email_gist_index on users using gist (email gist_trgm_ops)`);
  },
};
