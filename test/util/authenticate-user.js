/* eslint-disable */ // TODO re-enable

const log = (...args) => false && console.log('LOG', '[authenticate-user]', ...args);

module.exports = async (service, user, includeCsrf) => {
  if(!user) throw new Error('Did you forget the **service** arg?');
  log('authenticateUser()', user); // TODO remove
  if(process.env.TEST_AUTH === 'oidc') {
    if(user.password) throw new Error('Why are you trying to authenticate a user with uname/password when OIDC is enabled?');

    const username = typeof user === 'string' ? user : user.email.split('@')[0];
    const body = await oidcAuthFor(service, username);

    if (includeCsrf) return body;
    return body.token;
  } else {
    const credentials = (typeof user === 'string')
      ? { email: `${user}@getodk.org`, password: user }
      : user;
    const { body } = await service.post('/v1/sessions')
      .send(credentials)
      .expect(200);

    if (includeCsrf) return body;
    return body.token;
  }
};

async function oidcAuthFor(service, user) {
  const makeFetchCookie = require('fetch-cookie');
  try {
    const res1 = await service.get('/v1/oidc/login');

    // custom cookie jar probably not important, but we will need these cookies
    // for the final redirect
    const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
    res1.headers['set-cookie'].forEach(cookieString => {
      cookieJar.setCookie(cookieString, 'http://localhost:8383/v1/oidc/login');
    });
    log(cookieJar);

    log(res1.headers);
    const location1 = res1.headers.location;
    log({ location1 });

    const fetchC = makeFetchCookie(fetch, cookieJar);
    const res2 = await fetchC(location1);
    if(res2.status !== 200) throw new Error('Non-200 response');

    const location2 = await formActionFrom(res2);
    log({ location2 });

    // TODO try replacing with FormData
    const body = require('querystring').encode({
      prompt: 'login',
      login: user,
      password: 'topSecret123',
    });
    log(body);
    const res3 = await fetchC(location2, {
      method: 'POST', 
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body,
    });
    log('res3:', res3.headers);

    const location3 = await formActionFrom(res3);
    const body2 = require('querystring').encode({ prompt:'consent' });
    log({ location3 , body2 });
    const res4 = await fetchC(location3, {
      method: 'POST', 
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body: body2,
      redirect: 'manual',
    });
    log('res4:', res4);
    log('res4:', await res4.text());
    if(res4.status !== 303) throw new Error('Expected 303!');

    log(res4.headers);
    const location4 = res4.headers.get('location');
    log({ location4 });
    const res5 = await fetchC(location4, { redirect:'manual' });
    log('res5:', res5);
    log('res5:', await res5.text());
    const location5 = res5.headers.get('location');
    log({ location5 });

    const u5 = new URL(location5);
    const servicePath = u5.pathname + u5.search;
    log('Requesting from service:', 'GET', servicePath);
    //const res6 = await service.get(servicePath, { headers:{ cookie:cookieJar.getCookieStringSync(location5) } });
    const res6 = await service.get(servicePath)
        .set('Cookie', cookieJar.getCookieStringSync(location5))
        .expect(200);

    const sessionId = getSetCookie(res6, 'session');
    const csrfToken = getSetCookie(res6, '__csrf');

    return { token:sessionId, csrf:csrfToken };

  } catch(err) {
    log(`OIDC auth failed for user ${user}:`, err);
    throw err;
  }
}

function getSetCookie(res, cookieName) {
  const setCookieHeader = res.headers['set-cookie'];
  log(res.headers);
  if(!setCookieHeader) {
    log(`
      @@@@@@@@@@@@@@@@@@@@@@@
      @
      @ No cookie header found in response:
      @   res.status:  ${res.status}
      @   res.headers: ${res.headers}
      @
      @@@@@@@@@@@@@@@@@@@@@@@
    `);
    throw new Error('WHERE IS COOKIE:', +cookieName);
  }

  const prefix = `${cookieName}=`;
  return decodeURIComponent(setCookieHeader.find(h => h.startsWith(prefix)).substring(prefix.length).split(';')[0]);
}

async function formActionFrom(res) {
  const text = await res.text();
  try {
    return text.match(/<form.*\baction="([^"]*)"/)[1];
  } catch(err) {
    log('Failed to find form action in page:', text);
    throw err;
  }
}
