const assert = require('node:assert/strict');
const appRoot = require('app-root-path');
const { promisify } = require('util');
const { join } = require('path');
const tmp = require('tmp');
const { generateManagedKey } = require(appRoot + '/lib/util/crypto');
const { encryptToArchive, decryptFromArchive } = require(appRoot + '/lib/task/fs');
const { statSync, readdirSync } = require('node:fs');
const { execSync } = require('node:child_process');


describe.only('task: fs', () => {
  const passphrase = 'super secure';

  describe('encrypted archives', () => {
    const generateTestArchive = async bytes => {
      const originalDir = await promisify(tmp.dir)();
      const zipfile = await promisify(tmp.file)();
      execSync(`truncate -s ${bytes} ${originalDir}/a-file`);
      const initialSizes = fileSizes(originalDir);
      const keys = await generateManagedKey(passphrase);
      await encryptToArchive(originalDir, zipfile, keys);
      return [zipfile, initialSizes];
    };

    it('should round-trip successfully @slow', async function() {
      this.timeout(300_000);

      for(let bytes=16; bytes<18; ++bytes) {
        // given
        const [zipfile, originalFileSizes] = await generateTestArchive(bytes)
        const extractedDir = await promisify(tmp.dir)();

        // when
        await decryptFromArchive(zipfile, extractedDir, 'super secure')

        // then
        assert.deepEqual(fileSizes(extractedDir), originalFileSizes);
      }
    });
  });
});

function fileSizes(dir) {
  return Object.fromEntries(
    readdirSync(dir)
        .map(f => [ f, statSync(`${dir}/${f}`).size] ),
  );
}
