# Import necessary modules
# This file defines authentication routes for user signup and login
from fastapi import APIRouter, HTTPException, status, Form
import mysql.connector
import bcrypt as bcrypt_lib  

# Create a router to group authentication routes
router = APIRouter()

#Password length bcrypt can handle
MAX_PASSWORD = 72

# Function to connect to MySQL database
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="28@AVICII",
        database="heartgame_db"
    )

# ------------------ SIGNUP ROUTE ------------------

@router.post("/signup")
def signup(
    username: str = Form(...),   # Username sent through form
    password: str = Form(...),   # Password sent through form
):
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Converts password to bytes
        password_bytes = password.encode('utf-8')

        if len(password_bytes) > MAX_PASSWORD:
            password_bytes = password_bytes[:MAX_PASSWORD]

            while len(password_bytes) > 0 and (password_bytes[-1] & 0xC0) == 0x80:
                password_bytes = password_bytes[:-1]

        # Generates a salt and hashes the password securely
        salt = bcrypt_lib.gensalt()
        hashed_password_bytes = bcrypt_lib.hashpw(password_bytes, salt)
        hashed_password = hashed_password_bytes.decode('utf-8')

        # Check if the username already exists in the database
        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )

        # Insert query to add the new user to the database
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (username, hashed_password)
        )
        conn.commit()  # Save the changes

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
        # Close database connections properly
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ------------------ LOGIN ROUTE ------------------
@router.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    conn = None
    cursor = None
    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch the user's ID and hashed password using the username
        cursor.execute("SELECT id, password FROM users WHERE username=%s", (username,))
        row = cursor.fetchone()

        # If no user found, return invalid
        if not row:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        user_id, hashed = row[0], row[1]

        # Compares password with the stored hashed password
        if bcrypt_lib.checkpw(password.encode('utf-8'), hashed.encode('utf-8')):
            # If password matches, return success
            return {"message": "Login successful", "user_id": user_id}
        else:
            raise HTTPException(status_code=400, detail="Invalid credentials")

    finally:
        # Always close connections
        if cursor:
            cursor.close()
        if conn:
            conn.close()
