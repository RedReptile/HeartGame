from fastapi import APIRouter, HTTPException, status, Form
import mysql.connector
import bcrypt as bcrypt_lib

router = APIRouter()

# Maximum password length for bcrypt
MAX_PASSWORD = 72

# MySQL connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="28@AVICII",
        database="heartgame_db"
    )

@router.post("/signup")
def signup(
    username: str = Form(...),
    password: str = Form(...),
):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Hash password
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > MAX_PASSWORD:
            password_bytes = password_bytes[:MAX_PASSWORD]
            while len(password_bytes) > 0 and (password_bytes[-1] & 0xC0) == 0x80:
                password_bytes = password_bytes[:-1]

        salt = bcrypt_lib.gensalt()
        hashed_password_bytes = bcrypt_lib.hashpw(password_bytes, salt)
        hashed_password = hashed_password_bytes.decode('utf-8')

        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )

        # Insert new user including the 'field'
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (username, hashed_password)
        )
        conn.commit()
        return {"message": "User created successfully"}

    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, password FROM users WHERE username=%s", (username,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid credentials")
        user_id, hashed = row[0], row[1]
        # hashed is stored as text from bcrypt.hashpw(...).decode()
        if bcrypt_lib.checkpw(password.encode('utf-8'), hashed.encode('utf-8')):
            return {"message": "Login successful", "user_id": user_id}
        else:
            raise HTTPException(status_code=400, detail="Invalid credentials")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
