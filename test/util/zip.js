const yauzl = require('yauzl');
const { createWriteStream } = require('fs');
const streamTest = require('streamtest').v2;

// load zipfile into a buffer, then unzip and detangle the result.
// also, hooraaaayy callback hell.
// calls the callback with an object as follows:
// {
//      filenames: [ names of files in zip ],
//      {filename}: "contents",
//      {filename}: "contents",
//      …
// }
const zipStreamToFiles = (zipStream, callback) => {
  zipStream.buffer().parse(binaryParser).end((err, res) => {
    if(err) return callback(err);

    yauzl.fromBuffer(res.body, (err, zipfile) => {
      // eslint-disable-next-line keyword-spacing
      if(err) return callback(err);

      const result = { filenames: [] };
      const entries = [];
      let completed = 0;

      zipfile.on('entry', (entry) => entries.push(entry));
      zipfile.once('end', err => {
        if (entries.length === 0) {
          callback(null, result);
          zipfile.close();
        } else {
          entries.forEach((entry) => {
            result.filenames.push(entry.fileName);
            // eslint-disable-next-line no-shadow
            zipfile.openReadStream(entry, (err, resultStream) => {

              // eslint-disable-next-line keyword-spacing
              if(err) return callback(err);

              // eslint-disable-next-line no-shadow
              resultStream.pipe(streamTest.toText((err, contents) => {
                // eslint-disable-next-line keyword-spacing
                if(err) return callback(err);

                result[entry.fileName] = contents;
                completed += 1;
                if (completed === entries.length) {
                  callback(null, result);
                }
              }));
            });
          });
        }
      });
    });
  });
};

// eslint-disable-next-line no-confusing-arrow
const pZipStreamToFiles = (zipStream) => new Promise((resolve, reject) => { zipStreamToFiles(zipStream, (err, result) => err ? reject(err) : resolve(result)); });

module.exports = { zipStreamToFiles, pZipStreamToFiles };

function binaryParser(res, callback) {
  res.setEncoding('binary');
  res.data = '';
  res.on('data', function (chunk) {
    res.data += chunk;
  });
  res.on('end', function () {
    callback(null, new Buffer(res.data, 'binary'));
  });
}
