# it defines the database models for users and their game scores using SQLAlchemy ORM - applications interact with relational databases
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base                
from datetime import datetime           

# ---------- USER MODEL ----------

class User(Base):
    __tablename__ = "users"              

    # Columns (fields) in the "users" table
    id = Column(Integer, primary_key=True, index=True)        # Unique user ID (auto-increment)
    username = Column(String(50), unique=True, nullable=False) # Username (must be unique)
    password = Column(String(255), nullable=False)             # Hashed password
    highest_score = Column(Integer, default=0)                 # Highest game score (default 0)


# ---------- SCORE MODEL ----------

class Score(Base):
    __tablename__ = "scores"             

    # Columns in the "scores" table
    id = Column(Integer, primary_key=True, index=True)      
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    score = Column(Integer, nullable=False, default=0)      
    created_at = Column(DateTime, default=datetime.utcnow)   
