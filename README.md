<p align="center">
  <img src="./assets/admind-logo.svg" alt="AdMind Logo" width="100" />
</p>

<h1 align="center">AdMind</h1>

<p align="center">
  <strong>AI-Powered Multi-Agent Ad Campaign Optimization Platform</strong>
</p>

<p align="center">
  <a href="https://github.com/VivekYadav-77/AdMind/blob/main/Licence"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=for-the-badge" /></a>
  <img alt="Python 3.11+" src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img alt="React 18" src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=111827" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img alt="Gemini AI" src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-license">License</a>
</p>

---

## 📌 Overview

**AdMind** is a full-stack, production-grade SaaS platform that uses **multi-agent AI** to analyze paid advertising campaign data and generate actionable optimization reports. It simulates how a real performance marketing team works — an auditor spots problems, a strategist builds a plan, and a copywriter rewrites underperforming ads — all orchestrated through a streaming pipeline that delivers results in real time.

Beyond the core analysis engine, AdMind includes a complete user platform: authentication with email verification, team workspaces, analysis history with report exports, an AI toolbox, community reviews, a support ticket system, and a full admin panel.

> **Built by [Vivek Yadav](https://github.com/VivekYadav-77)**

---

## ✨ Features

### Core AI Pipeline
- **Multi-agent architecture** — Three specialized agents (Auditor → Strategist → Copywriter) process campaign data sequentially
- **Real-time SSE streaming** — Watch each agent work step-by-step in a live pipeline visualization
- **CSV upload + validation** — Upload Google Ads / Meta Ads campaign data or use the built-in sample dataset
- **Structured AI outputs** — All agent responses conform to Pydantic schemas for reliable, parseable results
- **Mock fallback mode** — Demo the full pipeline without burning API quota

### AI Toolbox
- **Landing Page Auditor** — Paste a URL and get a CRO audit powered by Gemini (fetches and analyzes the page content)
- **Audience Builder** — Describe your product and get precise Meta Ads + Google Ads targeting parameters
- **Competitor Teardown** — Paste competitor ad copy to receive psychological angle analysis and counter-ad suggestions
- **AI Image Generator** — Generate ad creatives using Cloudflare Workers AI or Pollinations with automatic fallback

### User Platform
- **JWT authentication** with email verification and password reset flows
- **Team workspaces** — Create workspaces, invite members, and collaborate on campaign analyses
- **Analysis history** — Browse, search, and revisit past reports with full audit/strategy/copy data
- **Report chat** — Ask follow-up questions about any completed analysis via AI-powered chat
- **PDF/DOCX export** — Export optimization reports as professional documents
- **A/B test tracker** — Track ad copy variant tests within workspaces
- **Community reviews** — Users can submit and browse community ratings
- **Support tickets** — Built-in ticket system for bug reports and feature requests

### Admin Panel
- **Dashboard analytics** — User counts, job stats, and platform health at a glance
- **User management** — View, ban, unban users; granular per-feature access controls
- **Job management** — Monitor and manage all analysis jobs across the platform
- **Review moderation** — Approve or reject community reviews
- **Ticket management** — Respond to and manage support tickets
- **Workspace oversight** — View all workspaces and their members
- **Activity log** — Track platform-wide user activity
- **Email analytics** — Monitor verification and password reset email delivery

### UI/UX
- **Dark/light mode** with system preference detection
- **Animated landing page** with Framer Motion transitions
- **Interactive data visualizations** using Recharts
- **Responsive design** — Mobile-first layout with TailwindCSS
- **Campaign Health Score** — Visual health metric for analyzed campaigns
- **Historical trend charts** — Spend, revenue, and ROAS trends over time

---

## 🏗 Architecture

### Agent Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      CSV Upload                             │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Agent 1 · Campaign Auditor                         │    │
│  │  Identifies wasted spend, low-CTR keywords,         │    │
│  │  zero-conversion keywords, high-CPC issues,         │    │
│  │  and segment anomalies (device, location, age)      │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Agent 2 · Strategy Advisor                         │    │
│  │  Generates prioritized actions: pause/reduce bids,  │    │
│  │  reallocate budget, scale winners, test new copy     │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Agent 3 · Ad Copywriter                            │    │
│  │  Rewrites underperforming ad headlines,              │    │
│  │  descriptions, and CTAs aligned with search intent   │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                   │
│                         ▼                                   │
│               Optimization Report                           │
│         (streamed live via SSE to the UI)                    │
└─────────────────────────────────────────────────────────────┘
```

### System Architecture

```
┌──────────────────────┐         ┌──────────────────────────────┐
│   React Frontend     │  SSE /  │    FastAPI Backend            │
│   (Vite + Tailwind)  │◄──────► │    (Gunicorn + Uvicorn)      │
│                      │  REST   │                              │
│  • Landing Page      │         │  • Auth (JWT + Email)        │
│  • Dashboard         │         │  • Agent Pipeline            │
│  • Analysis View     │         │  • Workspace Management      │
│  • AI Toolbox        │         │  • History & Chat            │
│  • Admin Panel       │         │  • Community & Tickets       │
│  • Settings          │         │  • Admin API                 │
└──────────────────────┘         └─────────────┬────────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                          ▼                    ▼                    ▼
                ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                │ PostgreSQL   │    │ Gemini API   │    │ Image APIs   │
                │ (Neon)       │    │ (Google AI)  │    │ (CF / Poll.) │
                └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|:------|:-------------|
| **Frontend** | React 18, Vite 5, TailwindCSS 3, Framer Motion, Recharts, React Router 7, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2, Gunicorn, Uvicorn |
| **Database** | PostgreSQL (Neon Serverless) |
| **AI** | Google Gemini API (structured JSON output with Pydantic schemas) |
| **Image Generation** | Cloudflare Workers AI (FLUX.1 Schnell), Pollinations (fallback) |
| **Authentication** | JWT (PyJWT), bcrypt password hashing, email verification via Google Apps Script |
| **Streaming** | Server-Sent Events (SSE) |
| **Deployment** | Docker (backend), Vercel (frontend), Render |
| **Export** | docx2pdf (LibreOffice-based PDF conversion) |

---

## 📁 Project Structure

```
AdMind/
├── backend/
│   ├── agents/                    # AI agent implementations
│   │   ├── auditor.py             # Campaign performance auditor
│   │   ├── strategist.py          # Strategy recommendation engine
│   │   ├── copywriter.py          # Ad copy rewriter
│   │   ├── landing_page_auditor.py  # Landing page CRO analyzer
│   │   ├── audience_builder.py    # Audience targeting builder
│   │   ├── competitor_teardown.py # Competitor ad analysis
│   │   └── utils.py               # Shared agent utilities
│   ├── routers/                   # API route handlers
│   │   ├── auth.py                # Registration, login, email verification
│   │   ├── analyze.py             # Campaign analysis endpoints
│   │   ├── history.py             # Analysis history & report retrieval
│   │   ├── chat.py                # AI chat for follow-up questions
│   │   ├── workspaces.py          # Workspace CRUD & member management
│   │   ├── tools.py               # AI toolbox endpoints
│   │   ├── community.py           # Community reviews
│   │   ├── tickets.py             # Support ticket system
│   │   └── admin/                 # Admin panel API
│   │       ├── dashboard.py       # Platform analytics
│   │       ├── users.py           # User management
│   │       ├── jobs.py            # Job oversight
│   │       ├── reviews.py         # Review moderation
│   │       ├── tickets.py         # Ticket management
│   │       ├── workspaces.py      # Workspace administration
│   │       ├── activity.py        # Activity tracking
│   │       └── email_analytics.py # Email delivery metrics
│   ├── db/                        # Database layer
│   │   ├── database.py            # SQLAlchemy engine & session
│   │   └── models.py             # ORM models (User, Workspace, Job, etc.)
│   ├── models/                    # Pydantic schemas
│   │   ├── schemas.py             # Request/response models
│   │   └── requests.py            # Request body models
│   ├── services/                  # External service integrations
│   │   ├── gemini.py              # Gemini API client with mock fallback
│   │   ├── csv_parser.py          # CSV ingestion and validation
│   │   ├── image_generator.py     # Multi-provider image generation
│   │   ├── email_service.py       # Email delivery via GAS webhook
│   │   └── email_templates.py     # HTML email templates
│   ├── middleware/
│   │   └── rate_limit.py          # In-memory rate limiting
│   ├── scripts/                   # Database migration & seed scripts
│   ├── tests/                     # Test suite
│   ├── data/
│   │   └── sample_data.csv        # Sample campaign dataset
│   ├── Dockerfile                 # Production Docker image
│   ├── requirements.txt           # Python dependencies
│   └── main.py                    # Application entry point
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── LandingPage.jsx    # Public marketing page
│   │   │   ├── Dashboard.jsx      # Main app dashboard
│   │   │   ├── Analyze.jsx        # CSV upload & live analysis
│   │   │   ├── History.jsx        # Past analysis reports
│   │   │   ├── ReportDetail.jsx   # Individual report view
│   │   │   ├── Tools.jsx          # AI toolbox (LP audit, audience, competitor)
│   │   │   ├── TestTracker.jsx    # A/B test tracking
│   │   │   ├── Settings.jsx       # User settings & profile
│   │   │   ├── Community.jsx      # Community reviews page
│   │   │   ├── SupportPage.jsx    # User support tickets
│   │   │   ├── Login.jsx          # Authentication pages
│   │   │   ├── Signup.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── BlogPage.jsx       # Blog listing
│   │   │   ├── BlogPost.jsx       # Individual blog post
│   │   │   ├── AboutUs.jsx        # About page
│   │   │   ├── ContactPage.jsx    # Contact form
│   │   │   ├── PrivacyPolicy.jsx  # Legal pages
│   │   │   ├── TermsOfService.jsx
│   │   │   └── admin/             # Admin panel pages
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Layout.jsx         # App shell with sidebar
│   │   │   ├── AdminLayout.jsx    # Admin panel shell
│   │   │   ├── AgentPipeline.jsx  # Live agent progress visualization
│   │   │   ├── AuditResults.jsx   # Audit report renderer
│   │   │   ├── StrategyResults.jsx  # Strategy recommendations renderer
│   │   │   ├── CopyResults.jsx    # Ad copy comparison renderer
│   │   │   ├── UploadZone.jsx     # Drag-and-drop CSV upload
│   │   │   ├── CampaignHealthScore.jsx  # Visual health gauge
│   │   │   ├── HistoricalTrends.jsx     # Trend charts
│   │   │   └── ui/               # Primitives (Modal, Toast, TabBar, Pagination)
│   │   ├── context/              # React context providers
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   ├── WorkspaceContext.jsx  # Active workspace state
│   │   │   └── ToastContext.jsx   # Toast notification system
│   │   ├── services/             # API clients
│   │   │   ├── api.js             # Main API service
│   │   │   ├── adminApi.js        # Admin API service
│   │   │   ├── apiFetch.js        # Fetch wrapper with auth headers
│   │   │   └── ticketApi.js       # Support ticket API service
│   │   └── hooks/
│   │       └── useReportExport.js # Report export logic (DOCX/PDF)
│   ├── vercel.json               # Vercel deployment config
│   ├── vite.config.js            # Vite bundler config
│   └── package.json              # Node dependencies
│
├── assets/
│   └── admind-logo.svg           # Brand logo
├── render.yaml                   # Render deployment blueprint
├── Licence                       # AGPL-3.0 license
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** database (or a [Neon](https://neon.tech) serverless instance)
- **Google Gemini API key** ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/VivekYadav-77/AdMind.git
cd AdMind
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require

# Frontend URLs (for CORS and email links)
FRONTEND_URL=http://localhost:5174
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:5174

# Optional — enables demo mode without real AI calls
GEMINI_USE_MOCK_FALLBACK=true

# Optional — for image generation
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# Optional — for email verification (Google Apps Script webhook)
GAS_WEBHOOK_URL=your_gas_webhook_url
GAS_SECRET=your_gas_secret
JWT_SECRET=your_jwt_secret
```

Run the database setup and start the server:

```bash
# Initialize database tables
python scripts/setup_db.py

# (Optional) Seed an admin user
python scripts/seed_admin.py

# Start the development server
python main.py
```

The backend will be available at `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_FRONTEND_URL=http://localhost:5174
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. Quick Start

1. Open `http://localhost:5173` in your browser
2. Create an account or log in
3. Navigate to **Analyze** and click **Try Sample Data**
4. Watch the three-agent pipeline process the campaign data in real time
5. Explore the generated optimization report

---

## 🐳 Docker

### Build & Run the Backend

```bash
cd backend
docker build -t admind-api .
docker run -p 8080:8080 --env-file .env admind-api
```

---

## 🌐 Deployment

### Backend — Render

The project includes a `render.yaml` blueprint for one-click deployment:

1. Connect your GitHub repository to [Render](https://render.com)
2. Create a new **Blueprint** and point it to `render.yaml`
3. Configure the environment variables in the Render dashboard
4. The backend will be built from the Dockerfile and deployed automatically

### Frontend — Vercel

1. Import the `frontend/` directory into [Vercel](https://vercel.com)
2. Set the `VITE_API_BASE_URL` environment variable to your deployed backend URL
3. Deploy — Vercel handles builds and CDN distribution automatically

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/health` | Health check — returns `{"status": "ok"}` |
| `GET` | `/sample-csv` | Download the sample campaign CSV |

### Authentication

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Authenticate and receive a JWT |
| `POST` | `/verify-email` | Verify email address with token |
| `POST` | `/resend-verification` | Resend verification email |
| `POST` | `/forgot-password` | Request a password reset email |
| `POST` | `/reset-password` | Reset password with token |
| `PATCH` | `/change-password` | Change password (authenticated) |

### Analysis *(Authenticated)*

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/analyze` | Upload CSV and start the multi-agent pipeline |
| `GET` | `/jobs` | List analysis history |
| `GET` | `/jobs/{id}` | Get full report for a specific analysis |
| `GET` | `/jobs/{id}/status` | Poll pipeline progress |

### AI Tools *(Authenticated)*

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/tools/landing-page` | Audit a landing page URL for CRO issues |
| `POST` | `/tools/audience` | Generate audience targeting from a product description |
| `POST` | `/tools/competitor` | Analyze competitor ad copy and generate counter-ads |

### Chat *(Authenticated)*

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/chat/{job_id}` | Send a follow-up question about a completed analysis |
| `GET` | `/chat/{job_id}` | Get chat history for a report |

### Workspaces *(Authenticated)*

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/workspaces` | Create a new workspace |
| `GET` | `/workspaces` | List workspaces for the current user |
| `POST` | `/workspaces/{id}/invite` | Invite a member to a workspace |

### Export *(Authenticated)*

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/export/pdf` | Convert a DOCX report to PDF |

### Community & Support *(Authenticated)*

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/community/reviews` | List community reviews |
| `POST` | `/community/reviews` | Submit a new review |
| `POST` | `/tickets` | Create a support ticket |
| `GET` | `/tickets` | List user's support tickets |

### Admin *(Superadmin Only)*

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/admin/dashboard` | Platform statistics |
| `GET` | `/admin/users` | List and search all users |
| `PATCH` | `/admin/users/{id}` | Ban/unban, verify, or promote users |
| `GET` | `/admin/users/{id}/controls` | Get per-feature access controls |
| `PUT` | `/admin/users/{id}/controls` | Update feature-level access for a user |
| `GET` | `/admin/jobs` | List all analysis jobs |
| `GET` | `/admin/reviews` | List reviews for moderation |
| `PATCH` | `/admin/reviews/{id}` | Approve or reject a review |
| `GET` | `/admin/tickets` | List all support tickets |
| `GET` | `/admin/workspaces` | List all workspaces |
| `GET` | `/admin/activity` | Recent platform-wide activity |
| `GET` | `/admin/email-analytics` | Email delivery metrics |

---

## 🧪 Testing

```bash
cd backend

# Run the test suite
python -m pytest tests/ -v

# Run a specific test file
python -m pytest tests/test_auth.py -v
```

---

## 🔧 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|:---------|:---------|:------------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `GEMINI_MODEL` | ✅ | Model name (e.g., `gemini-2.0-flash`) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string with `?sslmode=require` |
| `FRONTEND_URL` | ✅ | Frontend URL for email links |
| `FRONTEND_ORIGINS` | ✅ | Comma-separated CORS origins |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `GEMINI_USE_MOCK_FALLBACK` | — | Set `true` to use mock data when Gemini quota is exhausted |
| `GAS_WEBHOOK_URL` | — | Google Apps Script webhook for email delivery |
| `GAS_SECRET` | — | Secret for GAS webhook authentication |
| `CLOUDFLARE_API_TOKEN` | — | Cloudflare Workers AI token for image generation |
| `CLOUDFLARE_ACCOUNT_ID` | — | Cloudflare account ID |
| `GEMINI_IMAGE_API_KEY` | — | Separate Gemini key for image generation |
| `POLLINATIONS_API_KEY` | — | Pollinations API key (fallback image provider) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|:---------|:---------|:------------|
| `VITE_API_BASE_URL` | ✅ | Backend API URL (empty string for relative paths in production) |
| `VITE_FRONTEND_URL` | ✅ | Frontend URL for self-referencing links |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** — see the [Licence](./Licence) file for details.

---

## 👤 Author

**Vivek Yadav** — [@VivekYadav-77](https://github.com/VivekYadav-77)

---

<p align="center">
  <sub>Built with ☕ and multi-agent AI</sub>
</p>
