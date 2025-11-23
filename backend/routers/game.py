# Import FastAPI router and requests library
# Router for game-related endpoints

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import mysql.connector

#Router for game-related endpoints
router = APIRouter(tags=["game"])

# Function to connect to MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="28@AVICII",
        database="heartgame_db"
    )

# Pydantic model for score submission
class ScoreRequest(BaseModel):
    user_id: int
    score: int

# ------------------ GET QUESTION ROUTE ------------------
# game.py calls the HEART GAME API using requests.get on an URL:

@router.get("/question")
def get_question():
    """
    Fetches a random heart image question from an external API
    and returns the image in base64 forma
    """

    # API endpoint provides the heart images in JSON format with base64 encoding
    url = "http://marcconrad.com/uob/heart/api.php?out=json&base64=yes"

    # Makes a GET request to the external API
    r = requests.get(url)

    # Convert the response to JSON
    data = r.json()

    # Return the base64 image and the solution
    # 'image_base64' will contain the base64-encoded image
    # 'solution' will contain the correct answer
    return {
        "image_base64": data.get("image") or data.get("question"),
        "solution": data.get("solution")
    }

# ------------------ SAVE SCORE ROUTE ------------------
# It receives a user’s score, saves it to the database, and returns a success message with error handling and safe connection closure.
@router.post("/score")
def save_score(score_data: ScoreRequest):
    """
    Saves a user's score to the database
    """
    conn = None
    cursor = None
    try:
        # --- Connect to the database ---
        conn = get_db_connection()  # Establish a connection
        cursor = conn.cursor()      # Create a cursor to execute SQL queries

        # --- Insert the score record into the database ---
        cursor.execute(
            "INSERT INTO scores (user_id, score) VALUES (%s, %s)",
            (score_data.user_id, score_data.score)
        )
        conn.commit()  # Save (commit) the transaction

        # --- Return success response ---
        return {
            "message": "Score saved successfully",
            "user_id": score_data.user_id,
            "score": score_data.score
        }

    except Exception as e:
        # --- Roll back in case of error ---
        if conn:
            conn.rollback()
        # Raise HTTP error with details
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save score: {str(e)}"
        )

    finally:
        # --- Always close database resources ---
        if cursor:
            cursor.close()
        if conn:
            conn.close()
