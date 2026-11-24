from pydantic import BaseModel, Field

class CowData(BaseModel):
    cow_id: str
    activity: float = Field(..., description="Activity, steps per hour")
    rumination: float = Field(..., description="Rumination, minutes per day")
    temperature: float = Field(..., description="Body temperature, C")

class PredictRequest(BaseModel):
    cows: list[CowData]

class Prediction(BaseModel):
    cow_id: str
    probability: float = Field(..., ge=0, le=1)
    risk_level: str = Field(..., description="low, medium or high")

class Measurement(BaseModel):
    date: str = Field(..., description="Date, ISO format YYYY-MM-DD")
    activity: float
    rumination: float
    temperature: float