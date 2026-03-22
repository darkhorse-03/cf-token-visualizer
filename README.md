# CF Token Visualizer

A dashboard for exploring and managing Cloudflare infrastructure. Paste your API token to instantly view all your resources — zones, workers, R2 buckets, KV namespaces, AI gateways, and DNS records — through a single, read-only interface.

## Features

- **Account Overview** — Resource counts and stats at a glance
- **Zones** — View all DNS zones with details
- **Workers & Pages** — Deployments, handler types, analytics (requests, errors, latency), logs, and bindings
- **R2 Buckets** — Object storage overview
- **KV Namespaces** — Key-value storage listing
- **AI Gateway** — Gateway list with usage logs
- **DNS Records** — Per-zone DNS record details

### Team Mode

- Google OAuth sign-in
- Organization creation with role-based access (owner, admin, member)
- Member invitations
- Per-user resource-level permissions
- Organization-wide Cloudflare token management

## Tech Stack

- **Framework** — TanStack Start (React 19, TanStack Router, TanStack Query)
- **Styling** — Tailwind CSS + DaisyUI
- **Auth** — Better Auth (Google OAuth, organization plugin)
- **Database** — Drizzle ORM + Cloudflare D1 (SQLite)
- **Runtime** — Cloudflare Workers
- **Tooling** — Alchemy, Vite, TypeScript

## Setup

```bash
bun install
```

Create a `.env` file:

```
ALCHEMY_PASSWORD=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Run locally:

```bash
bun run dev
```

Deploy:

```bash
bun run deploy
```
