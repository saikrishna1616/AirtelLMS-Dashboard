# AIGeneratedDashboard

A working AirtelLMS learning operations dashboard created with Codex for the AI-Assisted SDLC Assignment. All learner, trainer, and training records are synthetic.

## Open locally

Open `LearnetLinq.WebUI/AIGeneratedDashboard/index.html` in Google Chrome. This runs directly from disk without installation, a web server, login, or a database. Assets use relative paths from the existing web project.

This standalone repository contains the dashboard only. MVC controller/project changes remain in the original AirtelLMS workspace and are intentionally excluded here. The existing application/database is not required.

## Features

Four views, shared period/circle/program filters, learning KPIs, SVG trend chart, status donut, completion bars, circle drilldown, rule-based recommendations, searchable/paginated batch and enrollment tables, batch modal, filtered CSV and summary CSV exports. No external dependencies or live AI endpoint.

## Source map

- `index.html`: accessible document and dashboard layout.
- `dashboard.css`: responsive styling and print treatment.
- `data.js`: deterministic synthetic dataset generation (480 learners, 42 batches, six programs, six circles, Apr–Oct 2026; seed 141026).
- `dashboard.js`: calculations, rendering, filtering, drilldowns, pagination and exports.
- `tests.html`: executable browser regression checks.
- `Validate-Dashboard.ps1`: Chrome headless validation, screenshots, and optional visible launch.

## Reproduce checks

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File docs/AIGeneratedDashboard/Validate-Dashboard.ps1
```

Use `-OpenDashboard` to open Chrome after successful validation. The test browser uses a separate profile under this dashboard's test artifacts. `--allow-file-access-from-files` is used only for the local test harness to inspect its iframe. Normal dashboard launch does not use this flag.

Test DOM, machine-readable result JSON, and desktop/mobile screenshots are written to `docs/AIGeneratedDashboard/artifacts/`. The script exits with failure if tests fail, Chrome times out, or screenshots are absent.

## Assignment deliverables

The completed Word submission table is [AirtelLMS_Dashboard_Submission.docx](AirtelLMS_Dashboard_Submission.docx). See [REPOSITORY_CHECKLIST.md](REPOSITORY_CHECKLIST.md) for all six required categories. Regenerate the document using `Generate-SubmissionDocument.ps1`.

`PRD.md`, `WORK_ITEMS.md`, `TEST_CASES.md`, `CODE_REVIEW.md`, `session chats.md`, `native-session.md`, `TIME_ANALYSIS.md`, `SUBMISSION.md`, test artifacts, and repository-local `.codex/` task documentation are included. The native session export contains actual visible messages through validation. Never publish the user-profile `.codex` directory; it can contain authentication and private history.

Participant: Saikrishna Gajjela. Repository: [AirtelLMS-Dashboard](https://github.com/saikrishna1616/AirtelLMS-Dashboard/tree/feature/ai-generated-dashboard). The dashboard-only GitHub package excludes the legacy application and its history. No assignment email has been sent.
