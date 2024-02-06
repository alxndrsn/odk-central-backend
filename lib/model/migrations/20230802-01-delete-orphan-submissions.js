module.exports = {
  up: (db) => {
    db.raw(`
          DELETE FROM submissions s 
          WHERE draft AND id IN ( 
            SELECT s.id FROM submissions s 
            LEFT JOIN submission_defs sd ON s.id = sd."submissionId" 
            WHERE sd.id IS NULL
          )`);
  },
};
