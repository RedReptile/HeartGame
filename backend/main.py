# FastAPI app sets up authentication and game APIs, connects to a database, and enables CORS for frontend access.
# Import FastAPI and routers
from fastapi import FastAPI
from routers import auth, game    
from database import Base, engine   
import models                      
import fastapi.middleware.cors as cors 

# ---------- CREATE DATABASE TABLES ----------

Base.metadata.create_all(bind=engine)

# ---------- CREATE FASTAPI APP INSTANCE ----------

app = FastAPI()

# ---------- INCLUDE ROUTERS ----------
# Authentication routes: /api/auth/signup, /api/auth/login
app.include_router(auth.router, prefix="/api/auth")

# Game routes: /api/game/question
app.include_router(game.router, prefix="/api/game")

# ---------- ROOT ENDPOINT ----------
@app.get("/")
def root():

    return {"message": "HeartGame FastAPI is running!"} #Test Point

# ---------- ENABLE CORS (Cross-Origin Resource Sharing) ----------
# Enables frontend apps to communicate safely with the FastAPI backend.

app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Allow requests from these frontend URLs
    allow_credentials=True,   # Allow sending cookies or authentication headers
    allow_methods=["*"],      # Permit all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],      # Permit all headers in requests
)
