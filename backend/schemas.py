from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    credits : Optional[int] = 5

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    credits: int

    class Config:
        model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type : str