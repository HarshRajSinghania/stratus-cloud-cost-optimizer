# Security Policy

## Supported version

Security fixes target the current `main` branch. Older commits and unmaintained forks are not supported.

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue, discussion, or pull request.

Use GitHub's private vulnerability reporting or draft security-advisory flow for this repository. Include:

- The affected component and version or commit.
- Reproduction steps or a minimal proof of concept.
- The expected impact, including tenant-isolation or credential exposure risk.
- Any suggested mitigation.

If private reporting is unavailable, contact the repository owner through their GitHub profile without publishing exploit details.

The maintainer should acknowledge a complete report within seven days, validate its impact, and coordinate disclosure after a fix is available. This is a best-effort open-source project, so response and release times are not guaranteed.

## Security boundaries

- Live cloud collectors are designed for read-only access.
- Cloud credentials are encrypted at rest with `SECRETS_KEY`.
- The application does not execute resource changes.
- SQLite is intended for local, single-process use; shared deployments should use PostgreSQL and a properly secured reverse proxy.

Never include real credentials, access tokens, customer inventory, or private logs in a report or test fixture.
