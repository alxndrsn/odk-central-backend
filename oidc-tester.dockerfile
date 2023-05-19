ARG node_version=16.19.1

# ---------- #

FROM alpine AS mkcertBuild

# Check for more recent mkcert versions at https://github.com/FiloSottile/mkcert/releases
ENV mkcert_version=1.4.4

WORKDIR /working

RUN wget -O mkcert "https://dl.filippo.io/mkcert/v${mkcert_version}?for=linux/amd64" && \
    chmod +x ./mkcert

# ---------- #

FROM node:${node_version}

# Set up main project dependencies - this layer is slow, but should be cached most of the time.
WORKDIR /odk-central-backend
COPY package.json package-lock.json /
RUN npm clean-install --legacy-peer-deps

# Set up oidc-tester dependencies - this layer is slow, but should be cached most of the time.
WORKDIR /odk-central-backend/oidc-tester
COPY oidc-tester/package.json oidc-tester/package-lock.json /
RUN npm clean-install

# Set up HTTPS.  mkcert is fast, but Docker doesn't seem to cache it.  So this
# step is run just prior to CMD
COPY --from=mkcertBuild /working/mkcert /usr/bin/mkcert
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

# TODO push some JSON config for odk-central-backend itself
RUN echo '{"default":{"database":{"host":"odk-postgres14"}}}' > config/local.json

# Run the tests, e.g.
# CMD npx playwright test oidc.spec.js
WORKDIR /odk-central-backend/oidc-tester
CMD ls && \
    echo '[oidc-tester] Configuring DNS...' && \
    # N.B. configuring DNS is done at runtime because Docker prevents write access before then.
    echo '127.0.0.1 fake-oidc-server.example.net' >> /etc/hosts && \
    echo '127.0.0.1      odk-central.example.org' >> /etc/hosts && \
	( \
      npx nf start & \
	  echo hi && \
      ./scripts/wait-for-it.sh localhost:8383 --strict --timeout=60 -- npm run test && \
      echo '[oidc-tester] Tests completed OK!' \
	)
