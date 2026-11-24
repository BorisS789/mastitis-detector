"""STUB: synthetic history built from the latest uploaded measurement.
The last day equals the uploaded values, earlier days drift from a
healthy baseline. Replace with a real database query."""
import random
from datetime import date, timedelta

from app.schemas import CowData, Measurement

BASELINE = {"temperature": 38.5, "rumination": 480.0, "activity": 70.0}


def make_history(cow: CowData, days: int = 7) -> list[Measurement]:
    rng = random.Random(cow.cow_id)
    today = date.today()
    result = []
    for i in range(days):
        k = (i / (days - 1)) ** 2
        is_last = i == days - 1

        def value(name: str, last: float, noise: float) -> float:
            base = BASELINE[name]
            jitter = 0 if is_last else rng.uniform(-noise, noise)
            return base + (last - base) * k + jitter

        result.append(
            Measurement(
                date=(today - timedelta(days=days - 1 - i)).isoformat(),
                temperature=round(value("temperature", cow.temperature, 0.1), 1),
                rumination=round(value("rumination", cow.rumination, 10)),
                activity=round(value("activity", cow.activity, 3)),
            )
        )
    return result