# 0005 — Ngrok runs as a compose service

**Status:** Accepted · 2026-08-06

## Context

The site is exposed publicly through Ngrok. Two options: install the ngrok binary on
the host and run `ngrok http 8080` by hand, or run the official `ngrok/ngrok` image
as a compose service.

Ngrok is **not installed** on the development machine, so the host route starts with
a Homebrew install and a second terminal to babysit.

## Decision

Run ngrok as a service in `docker-compose.yml`, pointed at the `web` service over the
compose network:

```yaml
ngrok:
  image: ngrok/ngrok:latest
  command: http web:80 --log stdout
  environment:
    NGROK_AUTHTOKEN: ${NGROK_AUTHTOKEN:?set NGROK_AUTHTOKEN in .env}
  depends_on:
    web: { condition: service_healthy }
```

`docker compose up` starts the site and the tunnel together. The inspector is on
`localhost:4040`.

## Consequences

- Nothing to install on the host; the whole stack is reproducible from the repo.
- The tunnel targets `web:80` on the internal network — it does not depend on the
  host port publish, so the two can be changed independently.
- `depends_on: service_healthy` means the tunnel never opens onto a server that isn't
  answering yet.
- `NGROK_AUTHTOKEN` uses compose's `:?` syntax, so a missing token fails fast with a
  readable message instead of a confusing container crash loop.
- **Free-tier behaviour to expect, not a bug:** the URL changes on every restart, and
  first-time visitors get an ngrok interstitial warning page. A reserved domain on a
  paid plan removes both — wire it through `NGROK_DOMAIN` and add `--url=$NGROK_DOMAIN`.
- The Nginx config sets `set_real_ip_from` for the compose subnet so access logs show
  real visitor IPs rather than the ngrok container's address.

## Revisit if

The site gets a real domain. Then ngrok is dropped for Caddy or Nginx with Let's
Encrypt, and this ADR is superseded.
