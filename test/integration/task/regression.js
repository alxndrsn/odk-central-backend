const assert = require('node:assert/strict');
const appRoot = require('app-root-path');
const { promisify } = require('util');
const { join } = require('path');
const tmp = require('tmp');
const { generateManagedKey } = require(appRoot + '/lib/util/crypto');
const { encryptToArchive, decryptFromArchive } = require(appRoot + '/lib/task/fs');
const { statSync, readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');


describe.only('task: fs', () => {
  describe('encrypted archives', () => {
    const generateTestArchive = async passphrase => {
      const originalDir = await promisify(tmp.dir)();
      const zipfile = await promisify(tmp.file)();
      // unpack the known-problematic data (69 MB uncompressed)
      console.log('unpacking data...');
      spawnSync('tar', ['xf', join(__dirname, '../../data/problematic-data-for-issue-9000.tar.xz'), '-C', originalDir]);
      const initialSizes = fileSizes(originalDir);
      const keys = await generateManagedKey(passphrase);
      await encryptToArchive(originalDir, zipfile, keys);
      return [zipfile, initialSizes];
    };

    it('should round-trip successfully @slow', async function() {
      // given
      this.timeout(30_000);
      const [zipfile, originalFileSizes] = await generateTestArchive('super secure')
      // and
      const extractedDir = await promisify(tmp.dir)();

      // when
      console.log('zipfile:', zipfile);
      console.log('extractedDir:', extractedDir);
      await decryptFromArchive(zipfile, extractedDir, 'super secure')

      // then
      assert.deepEqual(fileSizes(extractedDir), originalFileSizes);
    });
  });
});

function fileSizes(dir) {
  return Object.fromEntries(
    readdirSync(dir)
        .map(f => [ f, statSync(`${dir}/${f}`).size] ),
  );
}
