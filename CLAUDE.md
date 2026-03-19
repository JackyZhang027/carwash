# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Commands

## Development
composer run dev        # Start all dev servers (PHP, queue, pail logs, Vite)
composer run dev:ssr    # Same but with SSR enabled

## Testing
composer run test
php artisan test --filter=TestName

## Linting & Formatting
composer run lint
./vendor/bin/pint
npx eslint resources/
npx tsc --noEmit

## Database
php artisan migrate
php artisan db:seed

---

# Architecture

Stack:
- Laravel 12 (Backend)
- React 19 + TypeScript (Frontend)
- Inertia.js (SPA bridge)
- Tailwind CSS 4
- Vite

This is a monolithic Inertia application — DO NOT introduce separate REST APIs unless explicitly required.

---

# Development Principles

- Follow Laravel best practices (Controllers, Services, Form Requests)
- Keep business logic out of controllers
- Prefer reusable components in React
- Keep components small and focused
- Follow Laravel + Inertia conventions strictly
- Follow DRY (Don't Repeat Yourself)
- Avoid over-engineering

---

# Backend (Laravel)

Structure:
- Controllers → request/response only
- Services → business logic
- Form Requests → validation
- Models → Eloquent ORM

Rules:
- ALWAYS use Form Request for validation
- NEVER put business logic in controllers
- Use Eloquent relationships instead of raw queries when possible
- Use transactions for critical operations
- Prefer dependency injection

---

# Frontend (React + Inertia)

Structure:
- Pages → resources/js/pages
- Components → resources/js/components
- Layouts → resources/js/layouts

Rules:
- Use usePage() for shared props
- Use Link from Inertia (NOT <a>)
- Use router.post/put/delete for actions
- Extract reusable UI components
- Keep pages clean and declarative

---

# Inertia Best Practices

- Do NOT create API routes unless necessary
- Always return Inertia::render()
- Use partial reloads when possible
- Use preserveScroll and preserveState appropriately
- Use server-driven data instead of client fetching

---

# Authentication

Handled via Laravel Fortify

---

# UI & Styling

- Tailwind CSS 4 only
- Use existing component system
- Avoid inline styles
- Maintain design consistency

---

# File Uploads

- Use multipart/form-data
- Handle uploads in Laravel
- Store via Laravel Storage
- Return URL/path to frontend

---

# Testing

- Use Pest
- Prefer feature tests
- Use in-memory SQLite

---

# Performance Guidelines

- Avoid N+1 queries → use with()
- Use pagination for large datasets
- Use eager loading

---

# Naming Conventions

Backend:
- Controller → ProductController
- Service → ProductService
- Request → StoreProductRequest
- Model → Product

Frontend:
- Page → Products/Index.tsx
- Component → ProductCard.tsx
- Hook → useProducts.ts

---

# When Generating Code

Claude must:
1. Follow existing structure
2. Match coding style
3. Prefer simple solutions
4. Avoid unnecessary dependencies
5. Provide production-ready code

---

# Notes

- Prioritize maintainability and clarity
- Prefer readability over cleverness
