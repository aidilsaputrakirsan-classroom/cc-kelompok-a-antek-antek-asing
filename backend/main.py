from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Cloud App API",
    description="API untuk mata kuliah Komputasi Awan",
    version="0.1.0"
)

# CORS - agar frontend bisa akses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development saja
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Hello from Cloud App API!",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/team")
def team_info():
    return {
        "team": "cloud-team-antek-antek-asing",
        "members": [
            # TODO: Isi dengan data tim Anda
            {"name": "Muhammad Athala Romero", "nim": "10231059", "role": "Lead Backend"},
            {"name": "Muhammad Bagas Setiawan", "nim": "10231061", "role": "Lead Frontend"},
            {"name": "Muhammad Fikri Haikal Ariadma", "nim": "10231063", "role": "Lead DevOps"},
            {"name": "Nanda Aulia Putri", "nim": "10231067", "role": "Lead QA & Docs"},
        ]
    }