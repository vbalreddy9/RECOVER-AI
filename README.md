# RECOVR AI

Autonomous Payment Recovery Intelligence System

Detect payment failures. Investigate causes. Recommend and execute recoveries with auditability.

> RECOVR AI transforms payment recovery from a manual, reactive process into an intelligent, auditable workflow so teams can recover revenue faster and with confidence.


## Table of contents
- [Why RECOVR AI](#why-recovr-ai)
- [Key features](#key-features)
- [How it works](#how-it-works)
- [System architecture](#system-architecture)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Backend (API)](#backend-api)
  - [Frontend (UI)](#frontend-ui)
- [Example recovery flow](#example-recovery-flow)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)


## Why RECOVR AI
Payment failures are inevitable — provider timeouts, temporary bank or gateway failures, network instability, and transient infrastructure issues can all cause transactions to fail. When recovery is manual, organizations suffer:

- Lost revenue
- Slow, inconsistent recovery decisions
- High operational overhead for investigation
- Weak traceability and auditability

RECOVR AI surfaces incidents with the highest recovery potential, investigates root causes, recommends recovery strategies, executes validated actions with human approvals, and records everything for audit and review.


## Key features
- Recovery intelligence dashboard (revenue at risk, recoverable revenue, recovery rate)
- Automated payment incident detection and prioritization
- Investigation engine that identifies failure patterns and root causes
- Candidate scoring and strategy recommendation (e.g. SMART_RETRY)
- Safety & policy validation, duplicate protection
- Human approval workflow before execution
- Execution orchestration and audit logging


## How it works
1. Detect: Monitor payment streams and identify anomalous failure patterns and revenue exposure.
2. Investigate: Analyze incidents to surface likely root causes and recovery opportunities.
3. Plan: Score failed transactions and recommend a recovery strategy.
4. Validate: Apply candidate and policy checks, and require human approval if configured.
5. Execute: Run approved recoveries and track results.
6. Audit: Persist execution records for traceability.


## System architecture
A simplified flow:

Payment Failures -> Incident Detection & Anomaly Analysis -> Investigation Engine -> Recovery Intelligence -> Safety Validation -> Human Approval -> Recovery Execution -> Audit & Traceability

The repository contains both backend (FastAPI) and frontend (Next.js) components.


## Technology stack
- Frontend: Next.js, React, TypeScript
- Backend: Python, FastAPI, Uvicorn
- Data & artifacts: JSON-based audit logs (example), other storage as required


## Project structure
RECOVER-AI/

├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI application entry
│   │   ├── engine.py      # Investigation & recovery engine logic
│   │   ├── data.py        # Data utilities / sample data
│   │   ├── models.py      # Domain models & Pydantic schemas
│   │   └── audit_logs.json # Example audit log data
│   └── venv/              # Local virtual environment (should be gitignored)

├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── investigation/
│   │   ├── recovery/
│   │   ├── execution/
│   │   └── audit-logs/
│   ├── lib/
│   └── public/

├── screenshots/           # Add screenshots here (referenced in README)
└── README.md

Note: backend/venv/ should remain excluded using .gitignore.


## Getting started
Clone the repository and run the backend and frontend locally.

1. Clone

```bash
git clone https://github.com/vbalreddy9/RECOVER-AI.git
cd RECOVER-AI
```

### Backend (API)

Requirements: Python 3.10+ recommended

```bash
cd backend
# Create a virtual environment (Unix/macOS)
python -m venv venv
source venv/bin/activate

# Windows
# python -m venv venv
# venv\Scripts\activate

pip install -r requirements.txt  # if you have a requirements file

uvicorn app.main:app --reload
```

The backend will be available at:

http://127.0.0.1:8000

### Frontend (UI)

Requirements: Node.js 16+ / npm or pnpm

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

http://localhost:3000


## Example recovery flow
This repository includes a demo flow showing a complete recovery lifecycle. Example output:

- Strategy: SMART_RETRY
- Recovered Transactions: 3 / 3
- Recovered Revenue: ₹43,836
- Success Rate: 100%
- Audit Status: RECORDED


## Contributing
Contributions are welcome. Please open an issue to discuss changes before submitting a pull request. Typical contributions:
- Improve detection & scoring logic
- Add real provider integrations
- Add tests & CI
- Improve UI/UX

Please ensure sensitive credentials are never checked into source control.


## License
Include your chosen license here (e.g. MIT). If you don't have one yet, consider adding a LICENSE file.


## Author
Balu Vavilala

Built for intelligent payment recovery and fintech innovation.

If you found this project useful, consider starring the repository.
