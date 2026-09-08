# Contributing to SYA Website

Thank you for your interest in contributing! Please follow these guidelines.

## 🚀 Getting Started

1. **Fork & clone** the repository
2. **Install dependencies**: `bun install`
3. **Set up environment**: `cp .env.example .env` and fill in `ADMIN_SECRET`
4. **Push database**: `bun run db:push`
5. **Start dev server**: `bun run dev`

## 📋 Development Workflow

### Before Committing

```bash
# Lint must pass
bun run lint

# If you changed the Prisma schema
bun run db:push
```

### Commit Messages

We follow [Conventional Commits](https://conventionalcommits.org/):

| Type | Use for |
|------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation |
| `style:` | Formatting (no code change) |
| `refactor:` | Code restructuring (no behavior change) |
| `perf:` | Performance improvements |
| `test:` | Test additions/changes |
| `chore:` | Build/tooling changes |

Examples:
```
feat: add blog author profile pages
fix: correct OG image params await
docs: update README with deployment guide
refactor: extract landing data to lib/landing-data.ts
```

### Branch Naming

- `feat/description` — new features
- `fix/description` — bug fixes
- `chore/description` — maintenance tasks

## 🎨 Code Style

- **TypeScript** throughout (strict mode)
- **shadcn/ui** components preferred over custom implementations
- **Tailwind CSS** for styling (no inline styles unless necessary)
- **ES6+** import/export syntax
- `'use client'` / `'use server'` directives where needed
- **No `any` types** — use proper TypeScript types
- **No `dangerouslySetInnerHTML`** unless absolutely necessary (and documented why)

## 🧪 Testing

Currently the project relies on:
- `bun run lint` — ESLint with Next.js rules
- Manual QA via agent-browser

## 📁 Project Structure

See the [README](./README.md#-project-structure) for the full structure.

## 🔒 Security

- **Never commit `.env`** or any file containing secrets
- **Never commit `db/custom.db`** — it contains user PII
- If you discover a security vulnerability, please report it privately rather than opening a public issue

## 🚫 What NOT to Commit

- `.env` or `.env.*` (use `.env.example` for documentation)
- `db/*.db` (SQLite database files)
- `node_modules/`
- `.next/` (build output)
- `*.log` files
- `download/`, `upload/`, `tool-results/` (sandbox artifacts)

## ✅ Pull Request Checklist

- [ ] `bun run lint` passes
- [ ] No secrets in committed files
- [ ] Commit messages follow Conventional Commits
- [ ] Documentation updated (if applicable)
- [ ] Breaking changes documented in PR description
