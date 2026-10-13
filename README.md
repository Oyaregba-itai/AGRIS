# AGRIS — Agricultural Intelligence System

An advisory-first precision agriculture platform, beginning with Nigeria-focused examples.

## Current milestone

Phase 0, Step 1: development environment and repository skeleton.
No API, frontend application or trained model has been implemented yet.

## Principles

- Recommendations must state uncertainty, missing inputs and limitations.
- Dataset provenance, units and model evaluation must be documented.
- Simulated data and geometry must be clearly labeled.
- AGRIS must never automatically operate equipment.

## Structure

- `backend/`: API, storage and application services
- `frontend/`: farmer dashboard
- `ml/`: training, inference and evaluation
- `data/`: local datasets (excluded from Git)
- `tests/`: cross-component tests
- `docs/`: project documentation

## Windows setup

From this directory in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe --version
```

Optional activation:

```powershell
.\.venv\Scripts\Activate.ps1
```

Commands can use `.\.venv\Scripts\python.exe` directly if activation is unavailable.
Dependencies will be selected and verified in later milestones.
