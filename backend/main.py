from fastapi import FastAPI
from routers import auth, game
from database import Base, engine
import models
import fastapi.middleware.cors as cors

#Creats DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router, prefix="/api/auth")
app.include_router(game.router, prefix="/api/game")

@app.get("/")
def root():
    return {"message": "HeartGame FastAPI is running!"}


app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)