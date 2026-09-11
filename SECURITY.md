# Security Policy

> **Project**: Systematic Yield Analysts (SYA) Website
> **Repo**: https://github.com/ict7742-dot/sya-web-new-zai

## Reporting a vulnerability

If you believe you have found a security vulnerability in this project,
**please do not open a public GitHub issue**.

Instead, email `connect@systematicyield.in` with the subject line
`[SECURITY] <one-line summary>`. Include:

1. A description of the issue and its impact.
2. The affected file(s) or endpoint(s), with line numbers if possible.
3. A proof-of-concept (curl command, screenshot, or reproduction steps).
4. Suggested fix, if any.

We will acknowledge receipt within **48 hours** and aim to ship a fix
within **14 days** for high-severity issues. Public disclosure is
coordinated with the reporter — we will not publish details until the fix
is deployed and the reporter agrees the disclosure is appropriate.

## Scope

In scope:
- The application code in this repository (`src/**`, `prisma/**`,
  `next.config.ts`, `.github/workflows/ci.yml`).
- The production deployment at `https://systematicyield.in`.

Out of scope:
- Vulnerabilities in third-party dependencies — report those to the
  upstream maintainer (Next.js, Prisma, Vercel runtime, etc.). We track
  and patch them via `bun audit` and Renovate.
- The Angel One e-KYC flow we redirect to — that's Angel One's
  responsibility.
- The Postgres provider (Neon / Supabase / RDS) — report to the provider.

## Threat model

See [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) for the full threat
model: assets, adversaries, attack surface, mitigations, and residual
risk.

## Incident response

See [`docs/INCIDENT_RESPONSE.md`](docs/INCIDENT_RESPONSE.md) for the
severity rubric, on-call playbook, and postmortem template.

## Data retention

See [`docs/DATA_RETENTION.md`](docs/DATA_RETENTION.md) for what data we
collect, how long we keep it, and how to request access / correction /
deletion as a user.

## Disaster recovery

See [`docs/DR_PLAN.md`](docs/DR_PLAN.md) for RTO/RPO targets, recovery
procedures, and the quarterly recovery-test drill.
