---
title: Todo with Docker
repo: Nisschhal/todo-with-docker
summary: A containerised todo application used to work through multi-stage builds, service composition, and the dev-versus-production image split.
stack: [TypeScript, Docker, Docker Compose, Node.js]
order: 11
tier: archive
year: 2026
status: live
highlights:
  - Multi-stage builds separating toolchain from runtime
  - Service orchestration with Docker Compose
  - Distinct development and production image targets
---

## What it is

A deliberately small application used as a vehicle for the containerisation work:
multi-stage builds, layer caching, compose networking, and keeping the runtime image
free of build tooling.

## Why it's here

The techniques from this project are what run **this portfolio**. The site you are
reading is built by a Node stage and served by an Nginx stage that contains no Node
at all, composed alongside an ngrok tunnel container.

See [decisions/0004](https://github.com/Nisschhal) in this site's repo for the
reasoning behind that split.

## Notes

> **TODO:** Consider whether this earns a slot. It's a learning project, and the
> portfolio's own infrastructure now demonstrates the same skills more convincingly.
> If you cut it, the Docker/Nginx story is still told by this site's README.
