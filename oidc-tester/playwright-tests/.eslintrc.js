const rules = {};

// This rule does not work if the node_modules directory has not been populated.
// Downloading playwright is quite slow, so it's probably better we don't have
// to do that before linting.
if (process.env.CI) rules['import/no-unresolved'] = 'off';

module.exports = {
  extends: '../../.eslintrc.json',
  rules,
};
