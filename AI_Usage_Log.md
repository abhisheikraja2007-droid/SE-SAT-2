# AI Usage Logging

This document tracks the prompts and interactions with the AI assistant during the software development lifecycle for the Industrial Safety Management System (Nexus).

## Phase 1: Planning and Design

**Date:** 2026-10-10
**Task:** Draft Requirements Document and UML Diagrams

**Prompt 1:**
> "Phase 1: Planning and Design
> Draft the Requirement Document: Create a concise document defining the problem summary, the two actors (User, Administrator), FR1-FR10, NFRs (Reliability, Persistence, Maintainability, Usability, Security), business rules (BR1-BR10), and a traceability table linking Requirement IDs to UML elements and Test IDs.
> Finalize UML Diagrams: Export the exact Use Case and Class Diagrams required for the assessment.
> AI Usage Logging: Begin documenting the prompts you use for AI assistance (e.g., generating UML, coding suggestions) to include in your final AI Test Report."

**AI Response Summary:**
The AI generated a comprehensive markdown file (`Requirements_Document.md`) that included:
1. A tailored problem summary for the "Industrial Safety Management System".
2. Defined roles for the User and Administrator.
3. 10 Functional Requirements (FRs).
4. 5 Non-Functional Requirements matching the prompt's categories.
5. 10 Business Rules (BRs).
6. A traceability table mapping FRs to Use Cases/Classes and placeholder Test IDs.
7. Mermaid.js markdown syntax for both Use Case and Class Diagrams.

---
## Phase 2: Environment Setup and Database Design

**Date:** 2026-10-10
**Task:** Initialize Project, Setup Database, Insert Seed Data

**Prompt 2:**
> "Phase 2: Environment Setup and Database Design
> Initialize the Project: Set up your preferred framework (e.g., Spring Boot, React, or Node.js) maintaining a clear separation between the UI, business, and data access layers.
> Configure the Persistent Database: Create tables based on the minimum data requirements for the User, ServiceRequest, Resource, RequestStatusHistory, ValidationService, and RequestService entities.
> Insert Seed Data: Populate your database with two sample user accounts, one administrator account, and the mandatory synthetic resource data: S101 (Capacity 10, Active), S102 (Capacity 5, Active), and S103 (Capacity 0, Inactive)"

**AI Response Summary:**
1. Initialized a **Node.js** project with Express and SQLite (`package.json` created).
2. Set up the basic architecture: `src/server.js`, `src/services/ValidationService.js`, and `src/services/RequestService.js` to ensure clear separation of concerns (business layer vs UI/data layer).
3. Created an SQLite initialization script (`src/db/init.js`) to set up the Persistent Database schema containing `User`, `Resource`, `ServiceRequest`, and `RequestStatusHistory` tables.
4. Added statements to insert the required seed data (2 users, 1 admin, and the resources S101, S102, S103 with capacities).

---
## Phase 3: Core Backend and Business Logic

**Date:** 2026-10-10
**Task:** Implement auth simulation, validation services, transaction workflows, and strict status transitions.

**Prompt 3:**
> "Phase 3: Core Backend and Business Logic
> Implement Authentication Simulation: Build a simple role selector or login simulation to toggle between User and Administrator views.
> Develop Validation Services (BR1-BR4): Enforce the active-request limit (maximum 5 per user). Build the eligibility check to ensure requested services are active. Implement the charge calculation logic (Rs.50 below a base value of Rs.1,000, and Rs.0 at Rs.1,000 or above).
> Build the Transaction Workflow (BR5-BR10): Create the logic to save a submitted request, allocate resources, and record the status history atomically. Ensure that if any validation fails, no partial updates or records are created.
> Enforce Status Transitions: Restrict the state machine to the valid sequence: SUBMITTED -> APPROVED/ASSIGNED -> IN_PROGRESS -> COMPLETED, or CANCELLED. Prevent the Administrator from skipping stages."

**AI Response Summary:**
1. **Authentication Simulation**: Updated `server.js` with an Express middleware (`authSimulation`) that reads `X-User-Id` and `X-Role` from headers to toggle views and securely restrict endpoint access (User vs. Administrator).
2. **Validation Services**: Overhauled `ValidationService.js` to strictly enforce BR1 (max 5 active requests), BR2 (resource active and capacity > 0), BR3 (charge calculation based on `baseValue` threshold of Rs.1,000), and BR4 (strict status transitions preventing skips).
3. **Transaction Workflow**: Modified the database schema (`init.js`) to include `baseValue` and `charge` for `ServiceRequest`. Rewrote `RequestService.js` to utilize SQL transactions (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`) ensuring atomic updates—if validation fails, no capacity is modified or partial records saved.
4. **State Machine**: Enforced the strict state transitions inside the `ValidationService` using a lookup table to govern allowed next states.

---
## Phase 4: Frontend / API Development

**Date:** 2026-10-10
**Task:** Build User Portal, Administrator Portal, and Implement UI Error Handling.

**Prompt 4:**
> "Phase 4: Frontend / API Development
> User Portal: Build interfaces to create and display dispatch requests with unique IDs. Ensure the portal displays applicable charges, current status, and allows users to view and cancel only their own eligible requests.
> Administrator Portal: Build a view for the admin to see all relevant transactions and a mechanism to advance requests strictly to the next valid status.
> Error Handling: Implement clear UI error messages for invalid inputs, unauthorized access, or invalid status changes."

**AI Response Summary:**
1. **Frontend Architecture**: Created a vanilla HTML/JS/CSS single-page application (`public/index.html`, `public/app.js`, `public/style.css`) served statically by Express.
2. **User Portal**: Designed a form for Users to create requests by selecting an active resource and entering a base value. Users can view a table of their submitted requests (showing Req ID, Base Value, Charge, and Status) and can click a 'Cancel' button to cancel their own active requests.
3. **Administrator Portal**: Designed a view where the Administrator sees all global requests. A dynamic dropdown is provided next to active requests that explicitly strictly only shows the *next valid status transitions* (enforcing the state machine visually).
4. **Error Handling**: Implemented a standardized `showMessage(msg, isError)` UI function that displays clear, color-coded error/success banners when an API call fails (e.g., max limit reached, invalid transition, or unauthorized actions).

*Note: This log will be updated as the project progresses through subsequent phases.*
