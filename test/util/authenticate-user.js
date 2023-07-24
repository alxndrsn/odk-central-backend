module.exports = async (service, user, includeCsrf) => {
  if(!user) throw new Error('Did you forget the **service** arg?');
  console.log('authenticateUser()', user); // TODO remove
  if(process.env.TEST_AUTH === 'oidc') {
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
    console.log(cookieJar);

    console.log(res1.headers);
    const location1 = res1.headers.location;
    console.log({ location1 });

    const fetchC = makeFetchCookie(fetch, cookieJar);
    const res2 = await fetchC(location1);
    if(res2.status !== 200) throw new Error('Non-200 response');

    const location2 = await formActionFrom(res2);
    console.log({ location2 });

    // TODO try replacing with FormData
    const body = require('querystring').encode({
      prompt: 'login',
      login: user,
      password: 'topSecret123',
    });
    console.log(body);
    const res3 = await fetchC(location2, {
      method: 'POST', 
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body,
    });
    console.log('res3:', res3.headers);

    const location3 = await formActionFrom(res3);
    const body2 = require('querystring').encode({ prompt:'consent' });
    console.log({ location3 , body2 });
    const res4 = await fetchC(location3, {
      method: 'POST', 
      headers: { 'Content-Type':'application/x-www-form-urlencoded' },
      body: body2,
      redirect: 'manual',
    });
    console.log('res4:', res4);
    console.log('res4:', await res4.text());
    if(res4.status !== 303) throw new Error('Expected 303!');

    console.log(res4.headers);
    const location4 = res4.headers.get('location');
    console.log({ location4 });
    const res5 = await fetchC(location4, { redirect:'manual' });
    console.log('res5:', res5);
    console.log('res5:', await res5.text());
    const location5 = res5.headers.get('location');
    console.log({ location5 });

    const u5 = new URL(location5);
    const servicePath = u5.pathname + u5.search;
    console.log('Requesting from service:', 'GET', servicePath);
    //const res6 = await service.get(servicePath, { headers:{ cookie:cookieJar.getCookieStringSync(location5) } });
    const res6 = await service.get(servicePath)
        .set('Cookie', cookieJar.getCookieStringSync(location5));

    const sessionId = getSetCookie(res6, 'session');
    const csrfToken = getSetCookie(res6, '__csrf');

    return { token:sessionId, csrf:csrfToken };

  } catch(err) {
    console.log(`OIDC auth failed for user ${user}:`, err);
    process.exit(1);
  }
}

function getSetCookie(res, cookieName) {
  const setCookieHeader = res.headers['set-cookie'];
  console.log(res.headers);
  if(!setCookieHeader) {
    console.log(`
      @@@@@@@@@@@@@@@@@@@@@@@
      @
      @ No cookie header found in response:
      @   user: ${user}
      @   res.status:  ${res.status}
      @   res.headers: ${res.headers}
      @
      @@@@@@@@@@@@@@@@@@@@@@@
    `);
    return;
  }

  const prefix = `${cookieName}=`;
  return decodeURIComponent(setCookieHeader.find(h => h.startsWith(prefix)).substring(prefix.length).split(';')[0]);
}

async function formActionFrom(res) {
  const text = await res.text();
  try {
    return text.match(/<form.*\baction="([^"]*)"/)[1];
  } catch(err) {
    console.log('Failed to find form action in page:', text);
    throw err;
  }
}
