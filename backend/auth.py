from datetime import datetime,timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from database import SessionLocal
from models import UserModel
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()


# ------------------ JWT Config ------------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"  # ✅ JWT must use HS256 or RS256, not pbkdf2
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# ------------------ Password Hashing ------------------
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain text password against the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)


def get_user_from_db(db:Session,username: str):
    """Retrieve user from DB."""
    return db.query(UserModel).filter(UserModel.username == username).first()


def authenticate_user(db:Session,username: str, password: str):
    """Validate credentials and return user if correct."""
    user = get_user_from_db(db,username)
    if not user: 
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Generate JWT token with expiry."""
    to_encode = data.copy()  # ✅ fixed
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme),db:Session =Depends(get_db)):
    """Decode and verify JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_from_db(db,username)
    if user is None:
        raise credentials_exception
    return user


# def verify_api_key(x_api_key: str = Header(None)):
#     """Check if provided API key has remaining credits."""
#     credits = API_KEY_CREDITS.get(x_api_key, 0)
#     if credits <= 0:
#         raise HTTPException(status_code=401, detail="Invalid API Key or no credits")
#     return x_api_key