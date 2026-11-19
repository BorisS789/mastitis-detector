import csv
import io

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.ml.model import predict
from app.schemas import CowData, Prediction, PredictRequest

app = FastAPI(title="Mastitis Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def ranked(cows: list[CowData]) -> list[Prediction]:
    return sorted(predict(cows), key=lambda p: p.probability, reverse=True)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=list[Prediction])
def predict_endpoint(req: PredictRequest):
    return ranked(req.cows)

@app.post("/predict/csv", response_model=list[Prediction])
async def predict_csv(file: UploadFile):
    text = (await file.read()).decode("utf-8-sig")
    try:
        cows = [CowData(**row) for row in csv.DictReader(io.StringIO(text))]
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Bad CSV: {e}")
    return ranked(cows)