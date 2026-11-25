# Deploying the signalling Worker

The Worker in `worker/` provides room presence, signalling and chat for Bansify Meet. It is
**not** deployed by the Pages pipeline, and it cannot be deployed through an API call that
only uploads script content: it needs a **Durable Object namespace** and a migration, which
are created by `wrangler deploy`.

## What the Worker needs

| Requirement | Value |
|---|---|
| Script name | `meet` |
| Durable Object binding | `MEET_ROOMS` → class `MeetingRoom` |
| Migration | tag `v1`, `new_sqlite_classes: ["MeetingRoom"]` |
| Route | `meet.bansify.com/api/*` |
| Compatibility date | `2025-01-01` |

## Current state

- The script has been uploaded as `meet`, and the route `meet.bansify.com/api/*` points at it.
- The Durable Object binding and migration are **not** in place, so `env.MEET_ROOMS` is
  undefined and every signalling request fails. Creating a Worker version through the API
  with a `durable_object_namespace` binding returned HTTP 403 (error code 100123).
- Until the steps below run, `https://meet.bansify.com/api/meet/*` does not serve the Worker.

## How to deploy

```bash
cd worker
CLOUDFLARE_API_TOKEN=<token with Workers Scripts:Edit and Workers Durable Objects:Edit> \
  npx wrangler deploy
```

`wrangler` reads `wrangler.toml`, creates the namespace, applies the `v1` migration, attaches
the binding and publishes the route. No other step is required.

## Doing it from CI instead

Add a workflow that runs the same command with `CLOUDFLARE_API_TOKEN` stored as a repository
secret, so a merge to `main` deploys the Worker alongside Pages. The token needs
`Workers Scripts:Edit`, `Workers Durable Objects:Edit` and `Zone:Workers Routes:Edit`.

## Checking it worked

```bash
curl -X POST https://meet.bansify.com/api/meet/rooms
# {"ok":true,"code":"AB12CD"}
```

A JSON body means the Worker is serving. The HTML of the app means the route is not in place.

## Client side

The React app still connects peers through its existing path. Switching it to these
endpoints (`rooms`, `join`, `signal`, `chat`, `leave`) is a separate change, and it can only
be tested once the Worker answers.
