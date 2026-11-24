import csv
import io

from fastapi import FastAPI, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.history_stub import make_history
from app.ml.model import predict
from app.schemas import CowData, Measurement, Prediction, PredictRequest
from app.store import latest, save_latest

app = FastAPI(title="Mastitis Detector")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def ranked(cows: list[CowData]) -> list[Prediction]:
    save_latest(cows)
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


@app.get("/cows/{cow_id}/history", response_model=list[Measurement])
def cow_history(cow_id: str, days: int = Query(7, ge=2, le=60)):
    cow = latest.get(cow_id)
    if cow is None:
        raise HTTPException(status_code=404, detail="Unknown cow_id, upload data first")
    return make_history(cow, days)