# routers/game.py
from fastapi import APIRouter, HTTPException
import requests, uuid
import mysql.connector

router = APIRouter()

# Temporary in-memory storage for testing (question_id -> solution)
TEMP = {}

# MySQL connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="28@AVICII",
        database="heartgame_db"
    )

@router.get("/question")
def get_question():
    # Fetch from Heart API
    res = requests.get("https://marcconrad.com/uob/heart/api.php?out=csv&base64=yes")
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to get game")
    
    data = res.text.split(",")
    qid = str(uuid.uuid4())
    TEMP[qid] = data[1]  # solution stored server-side
    
    return {"question_id": qid, "image_base64": data[0]}

@router.post("/answer")
def submit_answer(question_id: str, answer: int, user_id: int = None):
    solution = TEMP.get(question_id)
    if solution is None:
        raise HTTPException(status_code=400, detail="Invalid question_id")
    
    correct = str(answer) == str(solution)
    
    # Remove question after answering
    TEMP.pop(question_id)

    # Update DB if user_id provided and answer correct
    if user_id and correct:
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            # Insert into scores table
            cursor.execute(
                "INSERT INTO scores (user_id, score) VALUES (%s, %s)",
                (user_id, 1)  # +1 per correct answer
            )
            # Update highest_score if needed
            cursor.execute(
                """
                UPDATE users 
                SET highest_score = GREATEST(highest_score, (
                    SELECT SUM(score) FROM scores WHERE user_id=%s
                )) 
                WHERE id=%s
                """,
                (user_id, user_id)
            )
            conn.commit()
        finally:
            cursor.close()
            conn.close()

    return {"correct": correct}
