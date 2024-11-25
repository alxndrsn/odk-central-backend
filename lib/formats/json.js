const Option = require('../util/option');

function parseJson(str) {
  try {
    return Option.of(JSON.parse(str));
  } catch (err) {
    return Option.none();
  }
}

module.exports = { parseJson };
