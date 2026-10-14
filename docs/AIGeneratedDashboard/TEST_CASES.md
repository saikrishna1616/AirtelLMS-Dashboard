# Test cases

Executable checks are in `LearnetLinq.WebUI/AIGeneratedDashboard/tests.html`, run in real Chrome by `Validate-Dashboard.ps1`. Results are recorded in `artifacts/test-results.json` and `artifacts/test-dom.html`.

| Area | Coverage |
| --- | --- |
| Data integrity | 480 learners / 42 batches; unique IDs; valid references; no duplicate learner within batch; capacity; progress, score and date consistency |
| KPI correctness | Status reconciliation; independent four-record fixture for learner uniqueness, score boundary and overdue logic; null assessment exclusion; zero denominators |
| Reporting scope | October-only and August-start quarter; combined circle/program intersection; batch total reconciliation |
| Exports | Commas, quotes and line breaks; formula prefixes neutralized; CSV sourced from current table selection across pages |
| Rendering | Four KPIs, SVG chart, initial table rows, scoped totals, no-match state without NaN |
| Interaction | Filter/reset, case-insensitive search, empty search, pagination, overdue batch filter, dialog open/close, circle drilldown, overdue learner insight |
| Accessibility basics | Navigation labels, skip link, close button accessible name |

Visual evidence captures 1440×1100 desktop and 390×844 mobile layouts. Screenshots do not replace manual assistive-technology testing. Export browser download completion, print output, screen-reader usability, and running/publishing the legacy ASP.NET application remain manual integration checks.
