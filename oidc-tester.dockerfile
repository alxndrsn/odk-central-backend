# N.B. cannot use 16.19.1 because of playwright dependency install issues
# We also need node 18 for oidc-provider(?... or TODO does it just need to be an ESM module?)
# TODO check node version support - the whole repo will prob update to 18 soon
ARG node_version=18

# ---------- #

FROM alpine AS mkcertBuild

# Check for more recent mkcert versions at https://github.com/FiloSottile/mkcert/releases
ENV mkcert_version=1.4.4

WORKDIR /working

# TODO try running without mkcert - we had to disable cert validation in a bunch of places anyway,
# so perhaps we can get away with some static certificates just saved in this repo.
RUN wget -O mkcert "https://dl.filippo.io/mkcert/v${mkcert_version}?for=linux/amd64" && \
    chmod +x ./mkcert

# ---------- #

FROM node:${node_version}

# Set up main project dependencies - this layer is slow, but should be cached most of the time.
WORKDIR /odk-central-backend
COPY Makefile package.json package-lock.json .
RUN npm clean-install --legacy-peer-deps

# Set up oidc-tester dependencies - this layer is slow, but should be cached most of the time.
WORKDIR /odk-central-backend/oidc-tester
COPY oidc-tester/package.json oidc-tester/package-lock.json .
RUN npm clean-install

WORKDIR /odk-central-backend/oidc-tester/fake-oidc-server
COPY oidc-tester/fake-oidc-server/package.json oidc-tester/fake-oidc-server/package-lock.json .
RUN npm clean-install

WORKDIR /odk-central-backend/oidc-tester/playwright-tests
COPY oidc-tester/playwright-tests/package.json oidc-tester/playwright-tests/package-lock.json .
RUN npm clean-install && echo -n 'Playwright: ' && npx playwright --version && npx playwright install --with-deps

# Set up HTTPS.  mkcert is fast, but Docker doesn't seem to cache it.  So this
# step is run just prior to CMD
COPY --from=mkcertBuild /working/mkcert /usr/bin/mkcert
WORKDIR /odk-central-backend/certs
RUN mkcert -install && \
    mkcert fake-oidc-server.example.net && \
    mkcert      odk-central.example.org

# Copy ALL files whitelisted in .dockerignore.  Note that this means there is no
# isolation at the Docker level between code or dependencies of the various
# servers that will run.  This is very convenient and probably allows for faster
# builds, but care should be taken to avoid interdependencies.

# TODO decision time!  We need to run postgres!  Can we just run with the normal script?  Or do we have to get into docker compose...?

WORKDIR /odk-central-backend
# TODO remove this... maybe?  really handy in dev to make sure we're getting up-to-date files
ARG CACHEBUST=1
COPY / .

# Start background services
# TODO maybe use foreman - need to start:
# odk-central-backend (http://localhost:8383)
# fake-oidc-server  (https://fake-oidc-server.example.net)
# fake-odk-frontend (https://odk-central.example.org)

COPY oidc-tester/odk-central-backend-config.json config/local.json

# Run the tests, e.g.
# CMD npx playwright test oidc.spec.js
WORKDIR /odk-central-backend/oidc-tester
CMD ./scripts/docker-start.sh
