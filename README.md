# Submission Scorer — Ticket 02

# If the application is loading for a long time it's because of inactivity and will be working properly in 1 minute (it's because of restricted functionality for free users in Render)

# Ticket Selection & Rationale
I chose Ticket 02: Submission Scorer. I wanted to build a robust, secure state machine (DRAFT to REVIEWED to PUBLISHED) across a full-stack boundary rather than relying solely on client-side state variables.

# Tech Stack & Justification
Frontend: React (TypeScript) deployed on Vercel.
Backend: Spring Boot (Java 17, Hibernate, PostgreSQL) deployed on Render.
This stack provides strict type-safety across both environments, reliable database transactions, and an enterprise-ready framework to enforce strict state transitions.

# Scope Adjustments & Simplifications
Hardcoded Submissions: Followed the specification to hardcode the candidate submission text into the initial view to focus purely on the evaluation pipeline.
UI Polish: Instead of getting to know that published reports can't be edited I showed a lock symbol below every feedback to make sure its uneditable.

# AI Tooling Integration & Critical Decisions
Usage: Used LLM assistance to generate clean mock data boundaries for the edge-case unit tests and structure the initial prompt layout for pillar evaluation.
Pushback: The AI initially recommended handling the "locked score" state machine purely via React frontend component state. I rejected this advice and moved the state validation rule directly into the Spring Boot REST controller/service layer.

# Total Time spent: 
2.5 to 3 Hours Coding core flow: 1.5 to 2 hours and Render/Vercel CI/CD pipeline configuration: 30 to 60 mins.

# How to Run the Tests
Backend Unit Tests: move to the backend package in main directory(submission-scorer -> backend)
command: mvn test