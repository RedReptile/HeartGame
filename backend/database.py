# Import necessary modules from SQLAlchemy
# It sets up the database connection and ORM - Object-Relational Mapping base class
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ---------- DATABASE CONFIGURATION ----------
MYSQL_USER = "root"                 # MySQL username
MYSQL_PASSWORD = "28%40AVICII"      # MySQL password (URL-encoded '@' as %40)
MYSQL_HOST = "127.0.0.1"            # Database host (localhost)
MYSQL_PORT = "3306"                 # MySQL port
MYSQL_DB = "heartgame_db"           # Name of the database

# ---------- DATABASE URL ----------

SQLALCHEMY_DATABASE_URL = (
    f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
)

# ---------- CREATE ENGINE ----------
# Engine is the core interface to the database, used to execute SQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# ---------- CREATE SESSION ----------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------- BASE CLASS FOR MODELS ----------
Base = declarative_base()
