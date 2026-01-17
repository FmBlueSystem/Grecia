# Gemini Conductor Methodology

> **"Context-First. Plan-Driven. Agentic-Ready."**

This document defines the core operating procedures for the **Grecia** project. All human developers and AI agents must adhere strictly to these rules.

## 1. Core Principles

### 🧠 Context-First
**Never write code without reading the context.**
Before starting any task, read:
1. `product.md` (Vision & Domain)
2. `tech-stack.md` (Approved Technologies)
3. `product-guidelines.md` (Conventions)
4. Active Track Spec & Plan

### 📋 Plan-Driven
**No code without a plan.**
- Every unit of work must belong to a **Track** in `.conductor/tracks/`.
- Every Track must have a `spec.md` (Why/What) and a `plan.md` (How).
- The `plan.md` must be updated *as you work* (check off items, add new discoveries).
- **Prohibited**: "Shadow coding" (implementing features not in a plan).

### 🤖 Agentic-Ready
**Build for orchestration.**
- The system is designed to be managed by AI agents.
- Documentation must be clear, explicit, and structured (Markdown).
- Code should be modular to allow agents to work on isolated parts safely.

## 2. The Workflow Cycle

1.  **Select/Create Track**: Pick a track from `tracks.md` or create a new one.
2.  **Read Context**: Load the relevant docs.
3.  **Update Plan**: If the plan is stale, update it before coding.
4.  **Implement**: Write code, strictly following `product-guidelines.md`.
5.  **Verify**: Run tests or verification scripts.
6.  **Update Status**: Mark plan items as done.
7.  **Commit**: Use Conventional Commits (e.g., `feat(auth): implement login`).

## 3. Directory Structure

```
.conductor/
├── product.md          # Project Vision (The "Constitution")
├── tech-stack.md       # Tech choices (Immutable without discussion)
├── tracks.md           # Index of all work streams
└── tracks/
    └── <track-id>/
        ├── spec.md     # Requirements
        └── plan.md     # Checklist & Progress
```

## 4. Code Standards (Summary)

- **Language**: TypeScript Strict Mode.
- **Style**: Prettier + ESLint.
- **Comments**: Why, not What. English for code, Spanish for UI text (supports i18n).
- **Paths**: Absolute paths only in agent tools.

## 5. Emergency Override
If a critical bug arises:
1. Create a `hotfix/<issue>` track.
2. Fix it.
3. Document it.
4. Merge.
(Do not skip the plan, even for hotfixes, unless site is down).
