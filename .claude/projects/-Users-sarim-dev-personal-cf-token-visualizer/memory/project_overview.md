---
name: CF Token Visualizer Overview
description: Open-source Cloudflare account visualizer - paste a token, see your zones/DNS/resources
type: project
---

Open-source tool where users paste a Cloudflare API token and get a visual dashboard of their account.

**Stack:** TanStack Start + TanStack Router (file-based) + TanStack Query + DaisyUI 5 + Tailwind 4

**Architecture:** Server functions proxy CF API calls (no CORS issues). Token stored client-side in localStorage/sessionStorage with a "remember me" toggle.

**MVP features (done):** Token input + verify, zones list, expandable DNS records per zone.

**Planned features:** Workers/Pages/R2/KV inventory, analytics (traffic/bandwidth/threats), token permissions introspection.

**Why:** No existing tool fills this gap. Closest is SukkaW/dashflare (130 stars) which only covers zone/DNS management, not visualization.
