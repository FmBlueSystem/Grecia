# Track Spec: Backend Core Features

## Context
This track is established to formalize the development of the backend API and authentication system, which were previously proceeding without a tracked plan (violating Conductor methodology).

## Requirements
- **Authentication**: Implement robust JWT-based authentication (Login, Register, Logout, Refresh Token).
- **Core API Endpoints**: specific CRUD endpoints for `Users`, `Contacts`, `Accounts`, and `Opportunities`.
- **Database**: Ensure Prisma migrations are managed and seeded correctly.
- **Validation**: Strict Zod validation for all inputs.

## Goals
- Secure the API with Authentication.
- replace any remaining in-memory mock data with real Database queries.
- Provide a stable API for the Frontend to consume.
