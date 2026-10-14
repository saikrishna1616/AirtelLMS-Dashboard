# AIGeneratedDashboard — Product requirements

Project: AirtelLMS. Assignment deadline: 15 October 2026. Data snapshot: 14 October 2026.

## Problem and stakeholders

Learning managers need a single view of training delivery, progress, assessments, and overdue learning across Airtel telecom circles. The existing MVC project contains batch management, trainee dashboards, assessments, and performance reporting, but its batch dashboard includes hardcoded example metrics and calendar placeholders.

## Requirements and user stories

| ID | User story | Acceptance criteria |
| --- | --- | --- |
| R01 | As a learning manager, I need an overview of training health. | Show unique enrolled learners, completion rate, assessment pass rate, and overdue enrollments. |
| R02 | As a circle manager, I need a relevant reporting scope. | Enrollment-period, circle, and program filters update all KPIs, charts, tables, and reports. Reset restores default scope. |
| R03 | As a learning manager, I need trends and comparisons. | Show enrollment-month trends, status distribution, program completion rates, and circle comparisons with accessible chart descriptions. |
| R04 | As a coordinator, I need actionable delivery detail. | Search and paginate batches; filter overdue or completed batches; inspect batch details in a dismissible dialog. |
| R05 | As a trainer, I need individual learner progress. | Display enrollment-level learner identity, program, circle, progress, assessment score, status, and due date. |
| R06 | As a stakeholder, I need exports. | Export all matching table records across pages; provide a summary CSV. Quote CSV values and neutralize spreadsheet formulas. |
| R07 | As an assignment reviewer, I need reproducible demo data. | Deterministic generation with seed 141026; clearly labeled synthetic records; no database or external service required. |
| R08 | As a reviewer, I need evidence of AI-assisted SDLC. | Include requirements, work items, design rationale, source, tests, review, chat/session evidence, and submission template. |

## KPI decisions

- Enrolled learners: distinct learner IDs among selected enrollment records.
- Completion rate: completed enrollments / all selected enrollments.
- Assessment pass rate: assessments scoring at least 70 / assessed enrollments. Null scores excluded.
- Overdue training: incomplete enrollment with due date strictly before snapshot date.
- Completion target: 80%, a demo target rather than a verified Airtel policy.
- Trend: records grouped by enrollment month; completion represents status at snapshot, not completions occurring during that month.
- October is partial through 14 October. Due dates may legitimately fall after the snapshot.

## Scope and architecture

Static HTML/CSS/JavaScript in the existing web project's `AIGeneratedDashboard` directory. No package installation, network requests, database access, or production employee records. The existing `BatchController` adds an entry action redirecting to the static dashboard; existing controller filters apply to that action. Static demo assets themselves are publicly accessible when served by IIS and contain only synthetic information.

Four views: overview, training batches, learner progress, reports/evidence. Shared filters persist between views. Table search and risk selection reset on navigation. CSV table exports honor shared filters plus table search/risk, across every page.

## Design decisions and references

Inspected `Views/Shared/_AirtelLMS.cshtml` and `Views/Batch/AirtelDashboard.cshtml`. Reuse the visually verified Airtel logo at `dist/assets/media/logos/Airtel_logo.png`, established red `#e40000`, light background, and card/table conventions. The similarly named `dist/img/Airtel_logo.svg` contained Ability Arena artwork and was excluded after visual inspection. Typography follows the existing Open Sans declaration with installed Segoe UI/Arial fallback; no remote font request. New dark sidebar and chart layout are design choices for this dashboard, not claimed to be official brand standards.

Responsive layouts support desktop, tablet, and mobile; keyboard focus, skip navigation, semantic headings/tables, native dialog, labeled filters, empty states, text status indicators, accessible chart labels, and reduced-motion preference included.

## Non-goals

Production integration, real model inference, emails, publishing, access-policy changes, and external repository creation are outside the dashboard task. The insight panel explicitly uses transparent rules on synthetic data.
