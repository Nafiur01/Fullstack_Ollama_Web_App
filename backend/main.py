from fastapi import FastAPI, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
import models,schemas
from fastapi.security import OAuth2PasswordRequestForm
import ollama
import os
from typing import Annotated, List
from database import engine
from dotenv import load_dotenv
from datetime import timedelta
from auth import get_db,authenticate_user,get_password_hash,create_access_token,get_current_user,ACCESS_TOKEN_EXPIRE_MINUTES

load_dotenv()


models.Base.metadata.create_all(bind=engine)

# ------------------ FastAPI Setup ------------------
app = FastAPI()
# API_KEY_CREDITS = {os.getenv("API_KEY", "secretkey_api"): 3}


# ------------------ Routes ------------------

@app.post("/token",response_model=schemas.Token)
def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],db: Session = Depends(get_db) ):
    """Authenticate and return a JWT access token."""
    user = authenticate_user(db,form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.UserModel).filter(models.UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = get_password_hash(user.password)
    new_user = models.UserModel(username=user.username, email=user.email, hashed_password=hashed_pw,credits=user.credits)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users", response_model = List[schemas.UserResponse])
def read_users(db:Session = Depends(get_db)):
    users = db.query(models.UserModel).all()
    if not users:
        raise HTTPException(status_code=404,detail="users not found")
    return users

# get info for particular user
@app.get("/users/{user_id}",response_model=schemas.UserResponse)
def read_user(user_id:int,db:Session = Depends(get_db)):
    user = db.query(models.UserModel).filter(models.UserModel.id==user_id).first()
    if not user:
        raise HTTPException(status_code=404,detail="users not found")
    return user

@app.post("/users/me",response_model=schemas.UserResponse)
def read_users_me(current_user: models.UserModel=Depends(get_current_user)):
    return current_user

@app.get("/")
def return_str():
    return {"test":"Hello World"}


@app.post("/generate")
def generate(
    prompt: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.credits <= 0:
        raise HTTPException(status_code=403,detail="no credit remaining")
    
    try:
        response = ollama.chat(
                model="mistral", 
                messages=[{"role": "user", "content": prompt}])
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Ollama Error: {e}")

    current_user.credits -= 1
    db.commit()
    db.refresh(current_user)

    return {
        "user": current_user.username,
        "response": response["message"]["content"],
        "remaining_credits": current_user.credits
    }