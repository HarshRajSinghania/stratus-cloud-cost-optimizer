# Contributing to Stratus

Thank you for improving Stratus. Contributions should preserve its core safety boundary: cloud collection is read-only, recommendations require human review, and the application does not execute cloud changes.

## Before you start

- Search existing issues and pull requests before opening a new one.
- Open an issue before a large behavior change, new cloud integration, schema change, or architectural rewrite.
- Small bug fixes, documentation corrections, and focused tests can go directly to a pull request.
- Never commit credentials, cloud account data, local databases, generated build output, or `.env` files.

## Local setup

1. Install Python 3.12 and Node.js 22.12+ or 24.
2. Run `python scripts/setup.py` from the project root.
3. From `backend`, create a virtual environment, install `requirements.txt`, and run `python -m alembic upgrade head`.
4. Start the API with `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`.
5. From `frontend`, run `npm ci` and `npm run dev`.

SQLite is the default local database. No cloud account is required; use sample inventory or a synthetic cloud account when developing.

## Development standards

- Keep organization data isolated in every query and write.
- Keep live cloud collectors read-only.
- Put inventory writes through the existing ingest path so validation, history, analysis, and audit records remain atomic.
- Add an Alembic migration for persisted schema changes.
- Preserve deterministic behavior when no LLM is configured.
- Prefer focused changes over new abstractions or unrelated cleanup.
- Add a regression test when a plausible bug could otherwise return.

## Verification

Run the checks relevant to your change:

```bash
cd backend
python -m pytest -q
```

```bash
cd frontend
npm run check
npm run build
```

For UI changes, also run the application and verify the affected workflow in a browser.

## Pull requests

A pull request should:

- Explain the user-visible problem and the chosen solution.
- Identify security, tenant-isolation, migration, or compatibility effects.
- Include exact verification steps and results.
- Update public documentation when behavior or configuration changes.
- Avoid generated files and unrelated formatting changes.

By submitting a contribution, you agree that it is licensed under the repository's MIT License.
