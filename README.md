# Submission Scorer — Ticket 02

Full-stack scoring app with Java Spring Boot, React TypeScript, and PostgreSQL.

## Architecture

```
submission-scorer/
├── backend/                  # Spring Boot 3 + Java 17
│   ├── src/main/java/com/scorer/
│   │   ├── controller/       # ScoreController (REST endpoints)
│   │   ├── service/          # ScoreService + AnthropicService
│   │   ├── repository/       # JPA ScoreRepository
│   │   ├── model/            # Score entity + ScoreStatus enum
│   │   ├── dto/              # Request/Response DTOs
│   │   └── config/           # RestTemplate + ObjectMapper beans
│   └── src/main/resources/
│       ├── application.properties
│       └── init.sql
├── frontend/                 # React 18 + TypeScript
│   └── src/
│       ├── pages/            # ScorerPage (main reviewer UI)
│       ├── components/       # PillarCard, PublishedView
│       ├── services/         # api.ts (Axios calls)
│       └── types/            # TypeScript types + PILLARS config
└── docker-compose.yml
```

## State Machine

```
DRAFT → REVIEWED → PUBLISHED (locked)
```

- **DRAFT**: AI-generated score, editable
- **REVIEWED**: Reviewer has made edits, still editable
- **PUBLISHED**: Locked forever. API returns 409 on any edit attempt

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/scores/generate` | Generate draft score via Claude |
| GET | `/api/scores/{id}` | Fetch score by ID |
| GET | `/api/scores/submission/{submissionId}` | Fetch latest score for submission |
| PUT | `/api/scores/{id}` | Update pillar scores/feedback |
| POST | `/api/scores/{id}/publish` | Publish score (locks it) |

## Quick Start

### Option A: Docker Compose (recommended)

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Start everything
docker-compose up --build

# App runs at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# Postgres: localhost:5432
```

### Option B: Manual

**Database**
```bash
psql -U postgres -f backend/src/main/resources/init.sql
```

**Backend**
```bash
cd backend
export ANTHROPIC_API_KEY=sk-ant-...
mvn spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

## Five Pillars

Each scored out of 20, total out of 100:

1. **Analytical Rigour** — Use of data, evidence, and structured thinking
2. **Commercial Acumen** — Business awareness, market understanding, revenue thinking
3. **Quality of Output** — Thoroughness, professionalism, and completeness of work
4. **Communication** — Clarity, conciseness, and effectiveness of communication
5. **Initiative & Ownership** — Proactiveness, decision-making, and taking responsibility

## Features

- ✅ Hardcoded candidate submission displayed on page
- ✅ "Generate draft score" calls Claude via Anthropic API
- ✅ Five pillar scores (each /20) with per-pillar feedback
- ✅ Inline editing of score + feedback per pillar
- ✅ Save / Discard per-pillar changes
- ✅ State machine: DRAFT → REVIEWED → PUBLISHED
- ✅ Publish button locks all editing
- ✅ 409 error + visible UI message when editing a published score
- ✅ Separate published view (candidate-facing) with total and ring chart
- ✅ PostgreSQL persistence
