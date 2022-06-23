const up = async (db) => {
  await db.raw(`
    CREATE TABLE some_thing(
      id      INT PRIMARY KEY NOT NULL,
      counter INT             NOT NULL
    );
    INSERT INTO some_thing (id, counter) VALUES(1, 0);
  `);
};

const down = async (db) => {
  // doesn't really matter
};

module.exports = { up, down };
