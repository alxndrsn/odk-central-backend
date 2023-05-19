oidc-tester
===========

Testing OpenID Connect / OAuth2 (OIDC) is tricky because there are a number of requirements and moving parts.

To properly test HTTP flows between servers and proper cookie handling, we need OIDC & ODK Central servers both:

1. running on separate hosts
2. serving over HTTPS

# TODO

* run odk-central-backend in a docker container
* add hosts for:
  * fake-oidc-server.example.net
  * odk-central.example.org
* add mkcert root CA inside container
* generate certs for fake hosts
* move all related stuff into this dir (except dockerfile & dockerignore), inc.
  * test-specific node dependencies (oidc-provider, playwright, http-proxy-middleware etc.)
  * test-oidc-server (maybe rename e.g. fake-oidc-server)
  * playwright config (if exists) + tests (oidc.spec.js)
