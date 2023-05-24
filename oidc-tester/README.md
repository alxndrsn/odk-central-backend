oidc-tester
===========

Testing OpenID Connect / OAuth2 (OIDC) is tricky because there are a number of requirements and moving parts.

To properly test HTTP flows between servers and proper cookie handling, we need OIDC & ODK Central servers both:

1. running on separate hosts
2. serving over HTTPS

# TODO

* add some way to run fake-oidc-server & reconfigure local.json to connect to it to allow for easy local dev (with frontend)
* resolve all TODOs
* now that we don't use mkcert, can we run all the services in different containers?
* run on all different browsers, and maybe even mobile ones
