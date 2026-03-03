# Enterprise Architecture Baseline (Laravel 12 + Inertia + TypeScript)

## Current Baseline Applied

This project has been upgraded with a production-safe baseline focused on maintainability and security:

- Versioned API entrypoint at `routes/api.php` with `v1` namespace.
- Unified JSON response contract via `App\Support\Api\ApiResponse`.
- Centralized API exception rendering in `bootstrap/app.php`.
- Security header middleware (`X-Frame-Options`, CSP, HSTS when HTTPS, etc.).
- Force JSON content negotiation for API endpoints.
- Stricter request authorization in critical form requests.
- Repository dependency inversion for `SubjectService`.
- Strongly typed exam domain contracts in frontend TypeScript.

## Recommended Enterprise Folder Strategy

Adopt module-first organization while keeping Laravel conventions:

```
app/
  Modules/
    Admin/
      Subjects/
        Http/
          Controllers/
          Requests/
          Resources/
        Domain/
          Entities/
          Services/
          Contracts/
        Infrastructure/
          Repositories/
    Student/
      Exams/
      Payments/
  Shared/
    Http/
    Security/
    Support/
```

Frontend (React + Inertia + TS):

```
resources/js/
  features/
    subjects/
      api/
      components/
      hooks/
      types/
    exams/
      api/
      components/
      hooks/
      types/
  shared/
    ui/
    hooks/
    lib/
    types/
```

## Security Checklist (Production)

- Keep CSRF enabled except explicit webhook routes.
- Use `auth:sanctum` + abilities/scopes for API authorization.
- Apply route throttling for login, payment, and answer endpoints.
- Sanitize user-supplied rich content before persistence.
- Enforce policy-based authorization in all mutating requests.
- Add monitoring/audit logging for auth, payments, and exam submissions.
- Enforce HTTPS and secure cookies in production env.

## REST API Standards

- `/api/v1/...` route versioning.
- Stable envelope: `success`, `message`, `data|errors`, `meta`.
- Correct status codes (`200`, `201`, `204`, `401`, `403`, `404`, `422`, `429`, `500`).
- Resource transformers for response shaping.
- Pagination metadata for collection endpoints.

## Database & Performance Recommendations

- Add composite indexes for high-frequency filters (exam attempts, student answers, payments).
- Use query scopes and eager loading defaults to prevent N+1 issues.
- Cache low-churn lookups with tagged invalidation.
- Queue heavy jobs (ranking, analytics, exports, notifications).
- Add idempotency handling for payment callbacks and checkout retries.

## CodeCanyon Readiness

- Consistent naming conventions and PSR-12 formatting.
- Setup script + clear installer documentation.
- Strict validation + localized user-facing messages.
- Feature tests for auth, payment callbacks, and exam lifecycle.
- Centralized error handling with non-sensitive production output.
