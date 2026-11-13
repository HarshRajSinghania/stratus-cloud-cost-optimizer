# Stratus — open-source multi-cloud cost optimizer

Run the frontend and backend directly on your computer. **SQLite works locally with no cloud account or database service.**

| Component | Technology | Local address |
|---|---|---|
| Frontend | JavaScript + Vite | http://localhost:5173 |
| Backend | Python + FastAPI | http://127.0.0.1:8000 |
| API documentation | Swagger UI | http://127.0.0.1:8000/docs |
| Database | SQLite by default; PostgreSQL optional | `cloud_optimizer.db` in the project root |

The dashboard is connected to the API. Organizations, users, inventory, findings, decisions, scans and audit events persist in the configured database. There is no browser-only fallback database.

## Included features

- **Multiple organizations.** Anyone can create an organization on the sign-in page and becomes its admin. Users sign in with email and password. Each organization has its own cloud accounts, credentials, inventory, recommendations, savings ledger, audit log and members, and cannot see another organization's data.
- Two roles: `admin` (adds and removes members, renames the organization) and `member`.
- Multiple AWS, Azure and GCP accounts, each optimized separately.
- Multi-cloud dashboard, cloud service comparison and a live monitor/troubleshooter with fix steps.
- Live read-only AWS and Azure collectors with encrypted credentials, scheduled sync and a no-credentials demo mode.
- Metric history, confidence on every recommendation, anomaly detection and per-account budgets.
- A savings ledger that verifies implemented changes against later data.
- Executive report, organization page and "Ask Stratus" (answers from your own data).
- Idle VM, oversized VM, after-hours scheduling and telemetry-quality analysis in Python.
- **Emulator accounts:** "AWS Emulator" and "Azure Emulator" connection modes serve static sandbox data for an imaginary startup (`backend/app/emulator_data.py`, which also lists the fake sandbox credentials the form accepts). They show 14 days of history from the first sync so every recommendation, approval and verification step can be demonstrated, and they are labelled **Emulator** everywhere. They are not real cloud data and do not contact LocalStack or any cloud.
- **Services page (AWS):** billed spend by service for the last three months (Cost Explorer) and a read-only inventory of EBS volumes, Elastic IPs, RDS, load balancers, Lambda, DynamoDB, S3 and EC2. It is visibility only; savings analysis still covers VMs. Needs extra read-only IAM permissions, listed on the page.
- Evidence and estimated savings displayed in the dashboard.
- Approve, dismiss, reopen and simulate workflows with server-side state checks.
- Updated resource data invalidates that resource's previous approval.
- Version checks reject decisions based on an outdated recommendation.
- Validated JSON inventory import, sample inventory and server-generated CSV export.
- Database migrations, durable audit records and API-token authentication.
- Optional OpenAI-compatible LLM explanations; deterministic explanation fallback without an API key.

**Safety boundary.** Stratus never changes a cloud resource. Live AWS and Azure collectors are read-only and currently verified with simulated cloud responses rather than customer accounts. GCP supports import and synthetic data. Costs use approximate on-demand list prices, so verified savings mean that a later resource reading costs less—not that a cloud invoice fell. Synthetic accounts are labelled in the UI. Review the [current limitations](docs/END_TO_END.md#9-current-limits-and-next-steps) before a production deployment.

## Screenshots

### Dashboard

![Dashboard showing cloud spend, potential savings, and account health](docs/screenshots/dashboard.png)

### Optimization recommendations

![Optimization recommendations with evidence and estimated savings](docs/screenshots/recommendations.png)

### Savings analysis

![Savings analysis showing approved and verified optimization value](docs/screenshots/savings-analysis.png)

## Folder map

| Folder / file | Purpose |
|---|---|
| `frontend/` | Connected dashboard, API client, Vite configuration and npm lockfile |
| `backend/app/` | FastAPI routes, models, schemas, rules, services, organization scoping (`tenant.py`) and sample data |
| `backend/alembic/` | Versioned database migrations |
| `backend/tests/` | API workflow, validation and rule tests |
| `scripts/setup.py` | Generate the local credential-encryption key and configuration template |
| `docs/END_TO_END.md` | Product workflow, operations, security model and limitations |
| `docs/API_REFERENCE.md` | Complete API routes and contracts |
| `docs/ARCHITECTURE.md` | Runtime flow, database and design choices |
| `.env.example` | Server and database configuration template |

## Prerequisites

- Python 3.12 recommended.
- Node.js 22.12+ or 24 and npm.
- Free local ports 5173 and 8000.

Extract the ZIP first and open terminals in the extracted `cloud-cost-optimizer` folder.

## Windows PowerShell setup

### 1. Create local configuration

Run from the project root:

```powershell
py -3.12 scripts/setup.py
```

The generated root `.env` uses a local SQLite database by default. The setup script also creates a unique credential-encryption key and refuses to overwrite an existing `.env`. Do not share or commit this file. PostgreSQL remains available for shared deployments; see Database configuration below.

### 2. Start the backend — terminal A

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

These commands use the virtual environment directly, so PowerShell script activation is not required. Leave this terminal running.

### 3. Start the frontend — terminal B

Open another terminal at the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173 and choose **Create an organization** (name, work email, password of 8+ characters). You become that organization's admin; add teammates under Organization → Members. Then use **Load sample inventory** on the dashboard to try the sample data. The frontend proxy forwards `/api` to the host backend on port 8000. **Do not put tokens in frontend environment variables.**

## Linux / macOS setup

From the project root:

```bash
python3 scripts/setup.py
```

The generated root `.env` uses local SQLite by default. To use PostgreSQL instead, replace `DATABASE_URL` as described under Database configuration. Then, in terminal A:

```bash
cd backend
python3 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m alembic upgrade head
./.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal B, starting at the project root:

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173 and create an organization, as above.

## Verify the connection

0. If you are upgrading an existing database, run `python -m alembic upgrade head` again. Migration 0004 moves the existing data into one organization (named after the old organization profile) that has no users yet: on the sign-in page choose **Create an organization** and enter that exact name to claim it as its admin. Existing sessions end and everyone signs in again.
1. Visit http://127.0.0.1:8000/health. It should return `status: ok`, `database: sqlite`, and `execution_mode: dry-run` for the default setup.
2. After **Load sample inventory**, the dashboard should show 12 sample resources and 8 findings. Estimated potential is **$1,293/month** from a **$4,318/month** illustrative compute run rate.
3. Review `checkout-staging-01`, enter a reviewer label and approve it.
4. Go to Approvals, review it and simulate execution.
5. Refresh the page or restart FastAPI: the decision and audit events remain in the configured database.
6. Import `docs/sample_inventory.json` from Cloud accounts → **Import JSON** to test the import pipeline.

The reviewer label is descriptive; the signed-in member's email is recorded as the actor in the audit log. Roles are limited to admin and member, there is no email verification or password reset (an admin sets passwords for members they add), and there is no single sign-on. Those are future production work.

## Database configuration

FastAPI and Alembic read `DATABASE_URL` from the root `.env`. The generated configuration uses a project-local SQLite file:

```dotenv
DATABASE_URL=sqlite+pysqlite:///../cloud_optimizer.db
```

The path is relative to the `backend` directory used by the documented commands. The resulting `cloud_optimizer.db` file is ignored by Git. Back up that file together with `SECRETS_KEY` if you need to preserve local data and encrypted cloud-account credentials.

For a shared or hosted deployment, replace the setting with a PostgreSQL URL:

```dotenv
DATABASE_URL=postgresql+psycopg://YOUR_USERNAME:YOUR_URL_ENCODED_PASSWORD@YOUR_HOST:5432/postgres?sslmode=verify-full&connect_timeout=15
```

Use the database name shown by your provider. URL-encode special characters in usernames and passwords. The backend supplies the `certifi` CA bundle for `verify-full`; providers with a private CA can add `sslrootcert=/absolute/path/to/provider-ca.pem`. See [PostgreSQL SSL documentation](https://www.postgresql.org/docs/17/libpq-ssl.html).

From `backend`, run `python -m alembic upgrade head` using your virtual environment before starting the API. This creates or upgrades the application tables for either database. Switching `DATABASE_URL` does not copy data between databases. Keep the existing `SECRETS_KEY` if you migrate encrypted cloud-account credentials.

## Stop and restart

- Press Ctrl+C in frontend and backend terminals.
- Start FastAPI and Vite with the same commands above. Reinstallation and reseeding are unnecessary.
- SQLite stops with the backend and persists in `cloud_optimizer.db`; manage hosted PostgreSQL through its provider.

## Tests and builds

From `backend`, using the relevant venv Python:

```bash
python -m pytest -q
```

Use `.\.venv\Scripts\python.exe -m pytest -q` on Windows, or `./.venv/bin/python -m pytest -q` on Linux if the venv is not activated. The single backend requirements.txt includes pinned application and test dependencies.

Tests use an isolated in-memory SQLite database by default; they never use the application `DATABASE_URL`. PostgreSQL integration testing is available by setting `TEST_DATABASE_URL` to a **dedicated test database whose name ends in `_test`**. Test fixtures drop/recreate tables there. Do not point this variable at a database with valuable data.

For PostgreSQL integration tests, provision a separate database such as `cloud_optimizer_test` in your cloud instance. Set `TEST_DATABASE_URL` to its PostgreSQL URL with `sslmode=verify-full`, then run pytest. Never use the application's database for these tests.

From `frontend`:

```bash
npm run check
npm run build
npm run preview
```

Preview is at http://localhost:4173 and also proxies the local backend. The Vite build creates `frontend/dist`; serve those assets behind a production web server/reverse proxy when you deploy later. Vite preview is for local checking.

## Optional integrations

- **AI features** use the OpenAI key and model from the root `.env` only (`LLM_API_KEY`, `LLM_MODEL`, optional `LLM_BASE_URL`; leave the key empty to disable AI). Restart FastAPI after editing. Features: Ask Stratus (the model picks from the built-in data handlers), monitor diagnosis, AI executive summary, approval assist, anomaly explanation, spend-forecast explanation, and finding explanations. The rules still compute every figure, status and risk; the model only routes, explains and drafts, and has no write tools. Without a key everything falls back to the deterministic behavior. Resource names, owners and metrics are sent to the provider when you use these features. Calls are limited to 30 per minute per backend process.
- Cloud account credentials are not needed for the sample workflow. Live AWS and Azure collection is optional and read-only; execution adapters are intentionally not included.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend refuses startup due to missing configuration | Run `scripts/setup.py` from the root and check the root `.env` |
| Database unavailable/schema missing | Check `DATABASE_URL` and run `python -m alembic upgrade head` from `backend` |
| PostgreSQL password authentication failed | Ensure the PostgreSQL username, password and database name match `DATABASE_URL` in `.env` |
| Cannot reach backend | Keep uvicorn running on port 8000; check `frontend/vite.config.js` and optional `frontend/.env.local` |
| Incorrect email or password | Check the email and password. Ask an admin of your organization to remove and re-add you if the password is lost (there is no reset yet) |
| Too many incorrect attempts | Wait 10 minutes, or restart the backend |
| `Database unavailable or schema missing` after pulling this version | Run `python -m alembic upgrade head` from `backend` (migration 0004 adds organizations and users) |
| Decision returns 409 | Evidence or status changed; refresh and review the latest recommendation |
| Cloud connection timeout or TLS error | Check cloud status, network access on port 5432, and the configured CA certificate |
| npm reports unsupported Node version | Install Node 22.12+ or 24 |
| Import fails | Match the sample JSON field names/types; maximum 500 resources and 1 MB via frontend |
| CORS error with another frontend origin | Update `CORS_ORIGINS` in root `.env` and restart the backend |

For an externally hosted frontend, configure an HTTPS API origin using `VITE_API_BASE_URL` at build time, CORS on the backend, and a trusted reverse proxy with TLS. The local proxy settings alone do not make the backend reachable on another computer.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, engineering constraints, verification commands and pull-request expectations. Use the issue templates for reproducible bugs and focused feature proposals. Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

Good first contribution areas include:

- GCP inventory collection.
- Additional optimization rules with explainable evidence.
- Billing-export reconciliation.
- Authentication and account-recovery improvements.
- Accessibility, responsive layout and documentation.

## Security

Do not report vulnerabilities or include credentials in public issues. Follow [SECURITY.md](SECURITY.md) for private reporting and supported-version information.

## License

Stratus is available under the [MIT License](LICENSE). Contributions are accepted under the same license.
