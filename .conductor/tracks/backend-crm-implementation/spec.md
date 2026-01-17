# Track Spec: Backend CRM Implementation

## Context
Implementation of core CRM modules inspired by Microsoft Dynamics 365. This track covers the backend data modeling, API routes, and standard frontend modules for a complete Sales CRM.

## Requirements
- **Database Schema**: Implement Lead, Opportunity, Quote, Order, Product, Case.
- **API**: Fastify routes with Zod validation.
- **Integration**: Hybrid sync strategy with SAP ServiceLayer.
- **Frontend**: 
  - Leads List & Qualification
  - Sales Pipeline (Kanban)
  - Logistics Tracking (Visual)
  - Dashboards (Sales, Service, Logistics)

## Goals
- Replicate Dynamics 365 "Sales" and "Service" core capabilities.
- Ensure "Premium" visual aesthetic as per Visual UX track.
- Enable end-to-end sales flow: Lead -> Opp -> Quote -> Order.

## Status mapping
- [x] Schema & Prisma Migration
- [x] Base Leads API & UI
- [ ] Sales Pipeline (Kanban)
- [ ] Quotes & Orders Module
- [ ] SAP Sync Jobs
