from app.schemas import CowData, Prediction

def risk_level(p: float) -> str:
    if p >= 0.7:
        return "high"
    if p >= 0.4:
        return "medium"
    return "low"

def predict(cows: list[CowData]) -> list[Prediction]:
    """STUB. The ML part replaces the body of this function.
    Do not change the signature (list[CowData] -> list[Prediction])."""
    results = []
    for c in cows:
        # made-up rule, only so the frontend sees different answers
        p = 0.05
        if c.temperature > 39.5:
            p += 0.5
        if c.rumination < 400:
            p += 0.3
        if c.activity < 50:
            p += 0.1
        p = round(min(p, 1.0), 3)
        results.append(Prediction(cow_id=c.cow_id, probability=p, risk_level=risk_level(p)))
    return results