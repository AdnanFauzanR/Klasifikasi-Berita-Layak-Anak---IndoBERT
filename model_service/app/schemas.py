# File: app/schemas.py
from pydantic import BaseModel, Field

class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=10)

class ClassifyResponse(BaseModel):
    label: str
    score: float
