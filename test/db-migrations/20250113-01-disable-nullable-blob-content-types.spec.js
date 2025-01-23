const assert = require('node:assert/strict');
const { hash, randomBytes } = require('node:crypto');

const { randomContentType } = require('../util/content-type');
const { // eslint-disable-line object-curly-newline
  assertRowCount,
  assertTableIncludes,
  describeMigration,
  rowsExistFor,
} = require('./utils'); // eslint-disable-line object-curly-newline

const log = (...args) => console.log(new Date(), '[null-content-type-migration]', ...args); // eslint-disable-line no-console

describeMigration('20250113-01-disable-nullable-blob-content-types', ({ runMigrationBeingTested }) => {
  const aBlobWith = props => {
    const randomContent = randomBytes(100);
    const md5 = hash('md5',  randomContent); // eslint-disable-line no-multi-spaces
    const sha = hash('sha1', randomContent);
    return { md5, sha, ...props };
  };
  const aBlob = () => aBlobWith({});

  const blob1 = aBlobWith({ contentType: null });
  const blob2 = aBlobWith({ contentType: 'text/plain' });

  before(async () => {
    await rowsExistFor('blobs', blob1, blob2);
  });

  it('should migrate 1,000,000 rows in a reasonable time @slow', async function() {
    this.timeout(5000 * 60_000); // FIXME decrease this as much as possible

    let nullRowCount = 0;
    const totalRowCount = 1_000_000; // FIXME should be 1000000
    const nullProportion = 0.0001;
    const batchSize = totalRowCount / 10;

    const totalBatches = totalRowCount / batchSize;

    // given
    log('@@@ Creating', totalRowCount.toLocaleString(), 'blobs in batches of', batchSize.toLocaleString(), '...');
    for (let batchNo=1; batchNo<=totalBatches; ++batchNo) { // eslint-disable-line no-plusplus
      const strBatchNo = batchNo.toString().padStart(totalBatches.toString().length, '0');
      const batch = [];
      log('  @', `[batch ${strBatchNo}/${totalBatches}]`, 'Generating blobs...');
      for (let j=0; j<batchSize; ++j) { // eslint-disable-line no-plusplus
        const contentType = (Math.random() < nullProportion) ? null : randomContentType();
        if (contentType === null) ++nullRowCount; // eslint-disable-line no-plusplus
        batch.push(aBlobWith({ contentType }));
      }
      log('  @', `[batch ${strBatchNo}/${totalBatches}]`, 'Saving blobs...');
      await rowsExistFor('blobs', ...batch); // eslint-disable-line no-await-in-loop
    }
    log('  @ All blobs created;', nullRowCount, 'have null rows.');
    await assertRowCount('blobs', totalRowCount + 2);

    // when
    log('@@@ Starting migration...');
    const start = performance.now();
    await runMigrationBeingTested();

    // then
    const end = performance.now();
    const migrationDuration = end - start;
    log('  @ Migration complete.  Took', migrationDuration, 'ms');
    assert.ok(migrationDuration < 5000);
  });

  it('should change existing NULL contentType values to application/octet-stream, and preserve non-NULL values', async () => {
    await assertTableIncludes('blobs',
      { ...blob1, contentType: 'application/octet-stream' },
      { ...blob2, contentType: 'text/plain' },
    );
  });

  it(`should create new blobs with contentType 'application/octet-stream' (contentType not supplied)`, async () => {
    const { md5, sha } = aBlob();

    const created = await db.oneFirst(sql`
      INSERT INTO blobs (md5, sha, "contentType")
        VALUES(${md5}, ${sha}, DEFAULT)
        RETURNING "contentType"
    `);

    assert.equal(created, 'application/octet-stream');
  });

  it(`should create new blobs with contentType 'application/octet-stream' (supplied DEFAULT contentType)`, async () => {
    const { md5, sha } = aBlob();

    const created = await db.oneFirst(sql`
      INSERT INTO blobs (md5, sha, "contentType")
        VALUES(${md5}, ${sha}, DEFAULT)
        RETURNING "contentType"
    `);

    assert.equal(created, 'application/octet-stream');
  });
});
