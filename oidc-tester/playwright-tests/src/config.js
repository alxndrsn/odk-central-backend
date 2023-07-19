const port = 8989;
// FIXME default to localhost and set env var in CI
const frontendUrl = process.env.ODK_CENTRAL_FRONTEND || `https://odk-central.example.org:${port}`;

module.exports = {
  frontendUrl,
  port,
}
