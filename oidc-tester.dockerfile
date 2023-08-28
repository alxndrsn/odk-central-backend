# Some of the most fiddly stuff WRT cookie settings are around Secure, SameSite,
# __Host, __Secure, and we cannot fully test this without both HTTPS and a non-
# localhost domain.
# See: https://web.dev/when-to-use-local-https/#when-to-use-https-for-local-development

# Make sure base image is compatible with Playwright system requirements.
# See: https://playwright.dev/docs/intro#system-requirements
# See: https://hub.docker.com/_/node
# See: https://wiki.debian.org/DebianReleases#Codenames
# See: https://en.wikipedia.org/wiki/Debian_version_history
FROM node:18.17.0-bullseye

# Set up main project dependencies - this layer is slow, but should be cached most of the time.
WORKDIR /odk-central-backend
COPY Makefile package.json package-lock.json .
RUN npm clean-install --legacy-peer-deps

WORKDIR /odk-central-backend/oidc-tester/fake-oidc-server
COPY oidc-tester/fake-oidc-server/package.json oidc-tester/fake-oidc-server/package-lock.json .
RUN npm clean-install

WORKDIR /odk-central-backend/oidc-tester/playwright-tests
COPY oidc-tester/playwright-tests/package.json \
     oidc-tester/playwright-tests/package-lock.json \
     .
RUN npm clean-install && echo -n 'Playwright: ' && npx playwright --version && npx playwright install --with-deps

# Copy ALL files whitelisted in .dockerignore.  Note that this means there is no
# isolation at the Docker level between code or dependencies of the various
# servers that will run.  This is very convenient and probably allows for faster
# builds, but care should be taken to avoid interdependencies.
WORKDIR /odk-central-backend
COPY / .

COPY oidc-tester/odk-central-backend-config.json config/local.json

WORKDIR /odk-central-backend/oidc-tester
CMD ./scripts/docker-start.sh
