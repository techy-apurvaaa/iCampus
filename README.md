# CPIP — Campus Project Intelligence Platform

## Phase 1 — Centralized Repository + Faculty Approval Workflow

CPIP is a MERN-based university project repository. Phase 1 focuses on building the institutional foundation before adding AI/semantic intelligence in later phases.

### What is complete in Phase 1

- Student / Faculty / Admin authentication
- JWT authentication + bcrypt password hashing
- Role-based access control
- Student project submission and draft workflow
- **Mandatory faculty-guide assignment before submission**
- **Faculty approval gate: submitted projects enter Pending and remain hidden**
- Faculty sees only projects assigned to them
- Approve / return-for-changes workflow with optional faculty feedback
- Approved projects become visible in the public repository
- Rejected projects can be corrected and resubmitted
- Admin dashboard with repository statistics
- Domain, technology and academic-year analytics
- Dataset vs real campus submission separation
- Public project discovery with search and filters
- Project details and source/documentation links
- Admin user management
- Public reference-data dashboard using the Past FYP Data dataset schema
- Clear source labeling for imported reference records

## Phase 1 workflow

```text
Student
   ↓
Select Faculty Guide
   ↓
Submit Project
   ↓
PENDING
   ↓
Assigned Faculty Review
   ├── Return for changes → Student edits → Resubmit
   └── Approve
          ↓
      APPROVED
          ↓
   Public Repository
```

**Important:** A student cannot directly publish a campus project. Only the assigned faculty guide can approve it.

## Dashboard dataset

The dashboard can be populated with the public **Past FYP Data** dataset:

https://www.kaggle.com/datasets/nabeelqureshitiii/past-fyp-data

The source describes a collection of final-year project ideas with title, abstract, domain, technologies, year and source URL fields.

A small dashboard-ready snapshot is included at:

```text
backend/data/past_fyp_demo.csv
```

It lets the dashboard work immediately. For the complete dataset, download the CSV from the source and run:

```bash
cd backend
npm run seed
node scripts/importFypDataset.js path/to/full.csv
```

Imported records are marked as `DATASET` and are never treated as real student submissions.

## Folder structure

```text
CPIP/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   │   └── importFypDataset.js
│   ├── data/
│   │   ├── README.md
│   │   └── past_fyp_demo.csv
│   ├── seed.js
│   ├── seedDemo.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   └── styles/
    ├── vite.config.js
    └── package.json
```

## Run locally

### Backend

```bash
cd backend
npm install
```

Configure `.env` from `.env.example`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
SEED_DEMO=true
```

Then:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@campus.edu | admin123 |
| Faculty | faculty@campus.edu | demo123 |
| Student | student@campus.edu | demo123 |

## Phase boundary

Phase 1 intentionally does **not** include:

- embeddings
- semantic similarity
- NLP analysis
- AI recommendations
- research-gap detection
- ML models

Those belong to Phase 2 and Phase 3.

The Phase 1 foundation is:

**Collect → Review → Approve → Preserve → Discover**
