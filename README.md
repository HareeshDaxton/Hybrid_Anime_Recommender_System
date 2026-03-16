<div align="center">
 
# 🎌 Hybrid Anime Recommendation System

> *"In a world of infinite anime, let the machine guide your next obsession."*

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Deep%20Learning-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-REST%20API-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![GKE](https://img.shields.io/badge/GKE-Autopilot-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/kubernetes-engine)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=for-the-badge&logo=jenkins&logoColor=white)](https://jenkins.io)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![DVC](https://img.shields.io/badge/DVC-Data%20Versioning-945DD6?style=for-the-badge&logo=dvc&logoColor=white)](https://dvc.org)

**A production-grade MLOps project** — from model training to live Kubernetes deployment, fully automated.

</div>

---

## 📖 Table of Contents

- [🌟 Project Overview](#-project-overview)
- [🧠 The ML Engine](#-the-ml-engine)
- [🎨 The Frontend Experience](#-the-frontend-experience)
- [⚙️ The Backend API](#️-the-backend-api)
- [🛳️ CI/CD Pipeline](#️-cicd-pipeline)
- [☁️ GCP Cloud Infrastructure](#️-gcp-cloud-infrastructure)
- [🏗️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [💻 Local Development Guide](#-local-development-guide)
- [🔌 API Reference](#-api-reference)

---

## 🌟 Project Overview

The **Hybrid Anime Recommendation System** is a fully end-to-end MLOps showcase — not just a model, but a living, breathing production system. It automatically trains, versions, containerizes, and deploys a scalable Deep Learning recommendation engine to the cloud with zero human intervention after a `git push`.

Think of it as your personal anime sage — one that has consumed the entire aniverse and knows exactly what you should watch next. 🍜

### ✨ Key Highlights

| Feature | Description |
|---|---|
| 🤖 **Hybrid Recommendations** | Fuses Content-Based Filtering + Collaborative Filtering via TensorFlow neural embeddings |
| ⚡ **Smart Autocomplete** | Debounced search bar powered by a pre-indexed anime title dataset |
| 🎨 **Glassmorphism UI** | Sleek, dark-themed aesthetic custom-built for anime enthusiasts |
| 🖼️ **Dynamic Posters** | AniList GraphQL (batched) → Jikan fallback for beautiful cover art |
| 🔁 **Fully Automated CI/CD** | Jenkins → Docker → GCR → GKE, hands-off end to end |
| 🏥 **Self-Healing Pods** | `/api/health` readiness & liveness probes for zero-downtime rollouts |

---

## 🧠 The ML Engine

> *Like Kishou Arima analyzing every opponent — our model studies every title, every user, every pattern.*

This isn't a simple lookup table. The recommendation engine is a **hybrid deep learning architecture** that understands anime from two angles simultaneously:

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID RECOMMENDATION ENGINE                  │
│                                                                  │
│  ┌──────────────────────┐     ┌───────────────────────────────┐ │
│  │  CONTENT-BASED ARM   │     │   COLLABORATIVE FILTERING ARM │ │
│  │                      │     │                               │ │
│  │  • Genres            │     │  • User watch history         │ │
│  │  • Format (TV/Movie) │ ──► │  • Rating behaviors           │ │
│  │  • Score & Popularity│     │  • Similar user clusters      │ │
│  │  • Episode count     │     │  • TensorFlow Embeddings      │ │
│  └──────────────────────┘     └───────────────────────────────┘ │
│                    ↓                        ↓                    │
│              ┌─────────────────────────────────┐                 │
│              │    CONFIGURABLE WEIGHT FUSION    │                 │
│              │    ( α × Content + β × Collab ) │                 │
│              └─────────────────────────────────┘                 │
│                              ↓                                   │
│                   🎯 Top 10 Recommendations                      │
└─────────────────────────────────────────────────────────────────┘
```

### Data Versioning with DVC

Real-world ML models are **massive**. GitHub has no place for multi-gigabyte `.h5` model files. This project uses **DVC (Data Version Control)** to:

- 📦 Store trained models, encoders, and processed datasets in **Google Cloud Storage (GCS)**
- 🔄 Version every dataset and model checkpoint like Git versions code
- 🚀 Allow Jenkins to `dvc pull` the exact model artifacts needed for each deployment — no manual copying, no stale models

```bash
# How Jenkins fetches the models (automated in pipeline)
dvc pull   # Pulls all tracked artifacts from GCS into /artifacts
```

---

## 🎨 The Frontend Experience

> *Like the opening sequence of a great shounen — it grabs you instantly.*

Built with **React 18** + **Vite** for blazing-fast development and production performance.

### Design Philosophy

The UI embraces a **dark glassmorphism aesthetic** — blurred glass panels, neon accents, and gradient halos — purpose-built for the anime community. No cookie-cutter component libraries. Every style is hand-crafted in vanilla CSS.

### Smart Poster Fetching

We implemented a **two-tier image resolution** strategy to ensure every recommendation looks beautiful:

```
Request 10 Recommendations
         ↓
① Batched GraphQL query → AniList API (1 HTTP call for all 10 posters)
         ↓
  Poster found? ──YES──► Render high-quality AniList art
         │
        NO
         ↓
② Fallback → Jikan API (MyAnimeList) per missing title
         ↓
  Render poster or placeholder
```

> **Why batch GraphQL?** Instead of 10 individual API calls, we fire a single batched GraphQL query to AniList for all posters at once — minimizing latency and respecting API rate limits like a true pro.

---

## ⚙️ The Backend API

Powered by **Python 3.11** and **Flask**, the backend is the single source of truth for the entire application.

- 🌐 **Serves the REST API** — all recommendation, search, and metadata endpoints
- 📁 **Serves the React Frontend** — the production-compiled `dist/` is served as static files directly from Flask
- 🏥 **Health reporting** — explicit liveness and readiness endpoints for Kubernetes orchestration

---

## 🛳️ CI/CD Pipeline

> *Like an S-class hero responding to a threat — the pipeline activates the moment danger (a code push) is detected.*

This is the crown jewel of the project. A **fully automated Jenkins pipeline** that takes your code from a `git push` all the way to a live Kubernetes deployment — no manual steps required.

```
🧑‍💻  git push → main branch (GitHub)
           │
           ▼
    ┌──────────────┐
    │   🤖 JENKINS  │  ← Triggered automatically
    └──────┬───────┘
           │
           ▼
    📥 CHECKOUT
    └─ Clones latest code from GitHub into a fresh workspace
           │
           ▼
    🐍 ENVIRONMENT SETUP
    └─ Creates Python venv, installs requirements.txt
           │
           ▼
    📦 DVC PULL
    └─ Authenticates with GCP → pulls models & datasets from GCS
       into the /artifacts folder (multi-gigabyte ML weights!)
           │
           ▼
    🐳 DOCKER MULTI-STAGE BUILD
    ├─ Stage 1 (Node.js): Compiles React → optimized /dist bundle
    └─ Stage 2 (Python):  Wraps /dist + Flask + TensorFlow deps
           │
           ▼
    🌍 DOCKER PUSH
    └─ Tags & pushes image to Google Container Registry (GCR)
           │
           ▼
    ☸️  KUBERNETES DEPLOY
    └─ kubectl apply -f deployment.yaml
       ├─ Pulls new image into pods on ml-app-cluster
       ├─ Performs rolling update (zero downtime)
       └─ Validates via /api/health readiness probe
           │
           ▼
    🎉 LIVE ON GKE
    └─ Traffic flows via GCP Load Balancer → Port 80 → World
```

---

## ☁️ GCP Cloud Infrastructure

The entire production system lives on **Google Cloud Platform**.

### Enabled APIs

| GCP Service | Purpose |
|---|---|
| **Artifact Registry / Container Registry** | Stores versioned Docker images built by Jenkins |
| **Kubernetes Engine API** | Manages the GKE Autopilot cluster and pod orchestration |
| **Cloud Storage API** | DVC remote backend — stores all ML models and processed datasets |

### Cluster Details

```yaml
Cluster Name:      ml-app-cluster
Mode:              GKE Autopilot (fully managed)
Workload:          Deployment → anime-recommender
Service Type:      LoadBalancer
External Port:     80
Container Port:    5000
Health Check:      GET /api/health
```

---

## 🏗️ Technology Stack

<div align="center">

| Layer | Technology | Purpose |
|---|---|---|
| 🐍 **Backend Language** | Python 3.11 | Core runtime |
| 🌐 **API Framework** | Flask | REST API + Static file server |
| 🧠 **ML Framework** | TensorFlow | Deep learning & embeddings |
| 📊 **Data Engineering** | Pandas, NumPy | Data wrangling & preprocessing |
| 🔄 **Data Versioning** | DVC + GCS | Model & dataset version control |
| ⚛️ **Frontend** | React 18 + Vite | UI framework + blazing fast builds |
| 🎨 **Styling** | Vanilla CSS | Glassmorphism design system |
| 🐳 **Containerization** | Docker (multi-stage) | Portable, reproducible builds |
| 🔁 **CI/CD** | Jenkins | Full pipeline automation |
| ☸️ **Orchestration** | GKE Autopilot | Production Kubernetes cluster |
| 📦 **Image Registry** | Google Container Registry | Docker image storage |
| 🗄️ **Artifact Storage** | Google Cloud Storage | DVC remote for ML artifacts |

</div>

---

## 📁 Project Structure

```
hybrid_Anime_Recommendation_System/
│
├── 📁 .dvc/                    # DVC configuration & remote pointers
├── 📁 .github/                 # GitHub templates & workflows (optional)
│
├── 📁 artifacts/               # [DVC TRACKED] — NOT committed to Git
│   ├── models/                 # Trained TensorFlow .h5 model files
│   ├── encoders/               # Label encoders & embedding metadata
│   └── processed/              # Cleaned & feature-engineered dataframes
│
├── 📁 config/                  # Centralized config (paths, hyperparameters)
│
├── 📁 frontend/                # React 18 Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── styles/             # Glassmorphism CSS modules
│   │   └── utils/
│   │       └── posterFetcher.js  # AniList GraphQL + Jikan fallback logic
│   ├── dist/                   # [Generated] Production build → served by Flask
│   └── vite.config.js
│
├── 📁 pipelines/               # Model prediction & training pipeline logic
├── 📁 src/                     # Raw data processing & model architecture
├── 📁 utils/                   # Helper scripts (anime metadata, etc.)
│
├── 🐍 app.py                   # Main Flask entrypoint (API + static server)
├── 🐳 Dockerfile               # Multi-stage build (Node → Python)
├── ☸️  deployment.yaml          # Kubernetes Deployment + LoadBalancer Service
├── 🤖 Jenkinsfile              # Full CI/CD pipeline definition
└── 📋 requirements.txt         # Python dependencies
```

---

## 💻 Local Development Guide

> *Every great ninja trains locally before going on missions.* 🥷

Because Flask serves the React frontend in production, local development uses a **dual-terminal setup** — the API and the UI run independently for hot-reloading bliss.

### Prerequisites

- Python 3.11+
- Node.js 18+
- GCP credentials configured (for `dvc pull`)
- DVC installed (`pip install dvc[gs]`)

---

### Terminal 1 — Flask API Backend

```bash
# Navigate to project root
cd hybrid_Anime_Recommendation_System

# Activate virtual environment (Windows PowerShell)
.\anime_venv\Scripts\activate

# Activate virtual environment (macOS / Linux)
source anime_venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Pull ML models & datasets from GCS via DVC
dvc pull

# Start the Flask API in debug mode
python app.py
# ✅ API is live at http://localhost:5000
```

---

### Terminal 2 — React Frontend (Dev Server)

```bash
# Navigate to the frontend directory
cd hybrid_Anime_Recommendation_System/frontend

# Install Node dependencies
npm install

# Start the Vite dev server (hot-reload enabled)
npm run dev
# ✅ UI is live at http://localhost:5173
```

> ⚠️ **Important:** In development mode, ensure all API calls in the frontend are proxied to `http://localhost:5000`. Vite's proxy config in `vite.config.js` handles this automatically.

---

## 🔌 API Reference

### `GET /api/health`
**Kubernetes Readiness Probe** — Returns `200 OK` once the TensorFlow models have fully loaded and the service is ready to handle traffic.

```json
{ "status": "healthy", "model_loaded": true }
```

---

### `GET /api/search?q={text}`
**Autocomplete Search** — Returns a list of matching anime titles from the indexed dataset based on the query string.

```
GET /api/search?q=attack
→ ["Attack on Titan", "Attack on Titan: Final Season", ...]
```

---

### `POST /api/recommend`
**Core Recommendation Endpoint** — Takes an anime name and optional weight parameters. Returns 10 hybrid recommendations.

```json
// Request Body
{
  "anime_name": "Fullmetal Alchemist: Brotherhood",
  "content_weight": 0.4,
  "collab_weight": 0.6
}

// Response
{
  "recommendations": [
    { "title": "...", "score": 9.1, "genres": ["Action", "Fantasy"], ... },
    ...
  ]
}
```

---

### `GET /api/anime/{name}`
**Anime Detail Lookup** — Fetches full metadata for a single anime title including synopsis, score, format, episodes, and genres.

---

<div align="center">

---

*"Even the most powerful model is only as good as the pipeline that delivers it."*

**Built with ❤️ and way too much anime research.**

[![MLOps](https://img.shields.io/badge/Focus-MLOps-blueviolet?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge)](.)
[![Cloud](https://img.shields.io/badge/Deployed%20on-GCP-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](.)

</div>