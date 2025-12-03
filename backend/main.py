# FastAPI app sets up authentication and game APIs, connects to a database, and enables CORS for frontend access.
# Import FastAPI and routers
from fastapi import FastAPI
from routers import auth, game    
from database import Base, engine   
import models                      
from fastapi.middleware.cors import CORSMiddleware

# ---------- CREATE DATABASE TABLES ----------

Base.metadata.create_all(bind=engine)

# ---------- CREATE FASTAPI APP INSTANCE ----------

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # add your deployed origin(s)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,   # important
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- INCLUDE ROUTERS ----------
# Authentication routes: /api/auth/signup, /api/auth/login
app.include_router(auth.router, prefix="/api/auth")

# Game routes: /api/game/question
app.include_router(game.router, prefix="/api/game")

# ---------- ROOT ENDPOINT ----------
@app.get("/")
def root():

    return {"message": "HeartGame FastAPI is running!"} #Test Point
