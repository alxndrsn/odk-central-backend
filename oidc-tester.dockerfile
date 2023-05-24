# N.B. cannot use 16.19.1 because of playwright dependency install issues
# We also need node 18 for oidc-provider(?... or TODO does it just need to be an ESM module?)
# TODO check node version support - the whole repo will prob update to 18 soon
FROM node:18

# Set up main project dependencies - this layer is slow, but should be cached most of the time.
WORKDIR /odk-central-backend
COPY Makefile package.json package-lock.json .
RUN npm clean-install --legacy-peer-deps

WORKDIR /odk-central-backend/oidc-tester/fake-oidc-server
COPY oidc-tester/fake-oidc-server/package.json oidc-tester/fake-oidc-server/package-lock.json .
RUN npm clean-install

WORKDIR /odk-central-backend/oidc-tester/playwright-tests
COPY oidc-tester/playwright-tests/package.json oidc-tester/playwright-tests/package-lock.json .
RUN npm clean-install && echo -n 'Playwright: ' && npx playwright --version && npx playwright install --with-deps

# Copy ALL files whitelisted in .dockerignore.  Note that this means there is no
# isolation at the Docker level between code or dependencies of the various
# servers that will run.  This is very convenient and probably allows for faster
# builds, but care should be taken to avoid interdependencies.

# TODO decision time!  We need to run postgres!  Can we just run with the normal script?  Or do we have to get into docker compose...?

WORKDIR /odk-central-backend
# TODO remove this... maybe?  really handy in dev to make sure we're getting up-to-date files
ARG CACHEBUST=1
COPY / .

COPY oidc-tester/odk-central-backend-config.json config/local.json

WORKDIR /odk-central-backend/oidc-tester
CMD ./scripts/docker-start.sh
