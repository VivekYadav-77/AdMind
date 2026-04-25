<p align="center">
  <img src="assets/brain-circuit.svg" alt="AdMind logo" width="120" />
</p>

<h1 align="center">AdMind</h1>

<p align="center">
  <strong>Multi-Agent Ad Campaign Optimizer</strong>
</p>

<p align="center">
  Built by <strong>Vivek Yadav</strong>
</p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=111827" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-AI_Agents-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

## Overview

AdMind is a full-stack multi-agent AI application that analyzes paid advertising campaign data from a CSV file and turns it into a practical optimization report.

The app simulates how a real growth team might review Google Ads or Meta Ads performance: one agent audits the account, another creates a strategy, and a third rewrites weak ad copy. Results stream live into a clean React interface so users can watch the analysis build step by step.

This project is designed as a portfolio-ready AI engineering project: it combines agent orchestration, structured AI outputs, FastAPI streaming, CSV analysis, and a polished frontend.

## What AdMind Does

AdMind accepts ad campaign CSV data and produces:

- A performance audit with spend, revenue, ROAS, wasted spend, and issue severity
- Strategic recommendations such as pausing keywords, reallocating budget, and testing copy
- Before/after ad copy rewrites for underperforming keywords
- A live visual pipeline showing each agent as it runs
- A sample-data workflow so anyone can test the product immediately

## Agent Pipeline

```text
CSV Upload
   |
   v
Agent 1: Campaign Auditor
   |
   v
Agent 2: Strategy Advisor
   |
   v
Agent 3: Ad Copywriter
   |
   v
Final Optimization Report
```

### Agent 1 - Campaign Auditor

Finds performance problems such as:

- Wasted spend
- Low CTR keywords
- Zero-conversion keywords
- High CPC issues
- Underperforming campaigns or ad groups

### Agent 2 - Strategy Advisor

Turns the audit findings into prioritized actions:

- Pause inefficient keywords
- Reduce bids on costly traffic
- Reallocate budget toward stronger campaigns
- Increase budget for high-ROAS areas
- Recommend new copy tests

### Agent 3 - Ad Copywriter

Creates improved ad copy for weak keywords:

- Better headlines
- Stronger descriptions
- Clearer calls to action
- Copy aligned with search intent

## Key Features

- CSV upload with validation
- One-click sample data
- Real-time Server-Sent Events streaming
- Multi-agent backend pipeline
- Structured Pydantic schemas for AI outputs
- FastAPI backend with sync and streaming endpoints
- React + Tailwind dashboard UI
- Gemini API integration with mock fallback for quota-safe demos

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, TailwindCSS, lucide-react |
| Backend | Python, FastAPI, Pydantic |
| AI | Google Gemini API |
| Streaming | Server-Sent Events |
| Data Input | CSV upload and sample CSV |
| Runtime | Stateless, in-memory pipeline |

## Project Structure

```text
AdMind/
  backend/
    agents/
      auditor.py
      strategist.py
      copywriter.py
      pipeline.py
    models/
      schemas.py
    services/
      csv_parser.py
      gemini.py
    main.py
    sample_data.csv
    requirements.txt

  frontend/
    src/
      components/
      services/
      App.jsx
      main.jsx
    vite.config.js
    tailwind.config.js

  assets/
    admind-logo.svg
```

## Getting Started

### 1. Backend

```bash
cd backend
.\.venv\Scripts\python.exe main.py
```

If you are setting up from scratch:

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
python main.py
```

Update `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_USE_MOCK_FALLBACK=true
```

`GEMINI_USE_MOCK_FALLBACK=true` keeps the demo working if Gemini quota is unavailable.

### 2. Frontend

```bash
cd frontend
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

Then click **Try Sample Data**.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| GET | `/sample-csv` | Download sample campaign CSV |
| POST | `/analyze` | Run pipeline with SSE streaming |
| POST | `/analyze-sync` | Run pipeline and return one JSON response |

## Why This Project Matters

AdMind demonstrates how agentic AI can be applied to a practical business workflow. Instead of asking one generic model to do everything, the system separates the work into specialized agents. This makes the pipeline easier to reason about, easier to test, and closer to how production AI systems are designed.

It also shows the complete product loop: upload data, process it through AI agents, stream progress live, and present results in a polished interface.

## Current Status

Completed:

- Backend foundation
- CSV parser
- Gemini service
- Three-agent pipeline
- FastAPI routes
- SSE streaming
- React frontend
- Sample data workflow
- Professional README and branding

## Author

**Vivek Yadav**

Project: **AdMind - Multi-Agent Ad Campaign Optimizer**
