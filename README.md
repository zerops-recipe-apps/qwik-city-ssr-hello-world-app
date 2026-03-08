# Qwik City SSR Hello World Recipe App

<!-- #ZEROPS_EXTRACT_START:intro# -->
A minimal Qwik City SSR application that renders server-side on Node.js and
connects to a PostgreSQL database. Demonstrates idempotent migrations, the
`zsc execOnce` pattern for multi-container safety, and Zerops environment
variable referencing — all within a single health check endpoint at `/`.
Used within [Qwik City SSR Hello World recipe](https://app.zerops.io/recipes/qwik-city-ssr-hello-world) for [Zerops](https://zerops.io) platform.
<!-- #ZEROPS_EXTRACT_END:intro# -->

⬇️ **Full recipe page and deploy with one-click**

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/qwik-city-ssr-hello-world?environment=small-production)

![Qwik City cover](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-qwik.svg)

## Integration Guide

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->

### 1. Adding `zerops.yaml`

The main application configuration file you place at the root of your
repository. It tells Zerops how to build, deploy, and run your application.

```yaml
zerops:
  # prod: optimized SSR build for staging and production deployments.
  # dev: full source deployed for interactive SSH development.
  - setup: prod
    build:
      base: nodejs@22
      # Ubuntu build environment: Vite/Rollup requires glibc binaries
      # unavailable on Alpine's musl libc during the build phase.
      os: ubuntu
      buildCommands:
        # npm ci: reproducible install from lock file (not npm install)
        - npm ci
        # Two-pass build: client assets → dist/, server bundle → server/
        - npm run build
      deployFiles:
        # Qwik City requires node_modules at runtime - not self-contained.
        # The server build externalizes deps; they must ship with the artifact.
        - dist
        - server
        - node_modules
        - package.json
        - migrate.js
      cache:
        - node_modules

    # readinessCheck: new runtime containers must pass before the
    # project balancer routes traffic to them (zero-downtime deploy).
    deploy:
      readinessCheck:
        httpGet:
          port: 3000
          path: /

    run:
      base: nodejs@22
      # initCommands run on every container start, before the app starts.
      # Migrations run here (not in buildCommands) so schema changes and
      # code deploy atomically — no mismatch if deploy rolls back.
      initCommands:
        # zsc execOnce: exactly one container executes across all replicas;
        # others wait. Prevents race conditions with multiple containers.
        - zsc execOnce ${appVersionId} -- node migrate.js
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: production
        DB_NAME: db
        # Referencing pattern: ${hostname_key} resolves to the generated
        # credential for the service with that hostname (e.g., hostname: db).
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      start: node server/entry.express.js

  - setup: dev
    build:
      base: nodejs@22
      # Ubuntu for dev: richer toolset for SSH-based development workflows.
      os: ubuntu
      buildCommands:
        # npm install (not npm ci): flexible for in-progress lock files
        - npm install
      # Deploy full source so the developer has everything via SSH.
      deployFiles: ./
      cache:
        - node_modules

    run:
      base: nodejs@22
      os: ubuntu
      initCommands:
        # Migration still runs in dev — database is ready when SSH opens.
        - zsc execOnce ${appVersionId} -- node migrate.js
      ports:
        - port: 3000
          httpSupport: true
      envVariables:
        NODE_ENV: development
        DB_NAME: db
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}
      # zsc noop: container stays idle; developer starts the dev server
      # manually via SSH (npm run dev → vite --mode ssr on port 3000).
      start: zsc noop --silent
```

<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
