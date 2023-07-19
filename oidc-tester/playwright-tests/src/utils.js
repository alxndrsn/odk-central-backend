module.exports = {
  assertLocation,
  assertLoginSuccessful,
  fillLoginForm,
};

const { frontendUrl } = require('./config');

const SESSION_COOKIE = (frontendUrl.startsWith('https://') ? '__Host-' : '') + 'session';

function assertLocation(page, expectedLocation) {
  console.log('  assertLocation()');
  console.log(`   expected: '${expectedLocation}'`);
  return  page.waitForFunction(title => {
    const actualLocation = window.location.href;
    console.log(`\n      actual: ${actualLocation}`);
    return actualLocation === expectedLocation;
  }, expectedLocation);
}

async function assertLoginSuccessful(page) {
  await expect(page.locator('h1')).toHaveText('Success!');

  const requestCookies = JSON.parse(await page.locator(`div[id=request-cookies]`).textContent());

  console.log('requestCookies:', JSON.stringify(requestCookies, null, 2));

  assert(requestCookies[SESSION_COOKIE], 'No session cookie found!');
  assert(requestCookies['__csrf'],       'No CSRF cookie found!');
  assert.equal(Object.keys(requestCookies).length, 2, 'Unexpected requestCookie count!');
}

async function fillLoginForm(page, { username, password }) {
  await page.locator('input[name=login]').fill(username);
  await page.locator('input[name=password]').fill(password);
  await page.locator(`button[type=submit]`).click();
  await page.getByRole('button', { name:'Continue' }).click();
}
