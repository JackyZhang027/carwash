# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
composer run dev        # Start all dev servers (PHP, queue, pail logs, Vite) concurrently
composer run dev:ssr    # Same but with SSR enabled
```

### Testing
```bash
composer run test       # Run all Pest tests
php artisan test --filter=TestName   # Run a single test
```

### Linting & Formatting
```bash
composer run lint       # Run PHP Pint + ESLint + TypeScript check
./vendor/bin/pint       # PHP formatting only
npx eslint resources/   # JS/TS linting only
npx tsc --noEmit        # TypeScript type checking only
```

### Database
```bash
php artisan migrate     # Run migrations
php artisan db:seed     # Seed database
```

## Architecture

**Stack:** Laravel 12 + React 19 + Inertia.js + TypeScript + Tailwind CSS 4

This is a monolithic full-stack app — no separate API. Laravel controllers return Inertia responses, which render React pages client-side with SSR support.

### Key Patterns

- **Routing:** `routes/web.php` + `routes/settings.php`. No `api.php` — all routes serve Inertia pages.
- **Authentication:** Handled entirely by [Laravel Fortify](app/Providers/FortifyServiceProvider.php). Features enabled: registration, password reset, email verification, 2FA. Fortify views are Inertia pages (not Blade).
- **Inertia middleware:** [HandleInertiaRequests.php](app/Http/Middleware/HandleInertiaRequests.php) shares global props: app name, auth user, sidebar open state.
- **Settings:** Controllers under `app/Http/Controllers/Settings/` follow a pattern: `edit()` returns Inertia page, `update()` handles form submission.
- **React pages:** Located in `resources/js/pages/`. Inertia maps route responses to page components by name.
- **UI components:** Radix UI primitives + custom components styled with Tailwind CSS 4. Component config in [components.json](components.json).

### Database

SQLite by default (even in production via `.env`). Sessions, cache, and queues all use the `database` driver.

### Testing

Uses **Pest** (not PHPUnit directly). Tests use SQLite `:memory:` database. Feature tests are in `tests/Feature/`, covering auth flows and settings.

### Production Security Defaults

[AppServiceProvider](app/Providers/AppServiceProvider.php) enforces stricter password rules in production (12+ chars, mixed case, symbols, uncompromised) and disables destructive DB commands.
