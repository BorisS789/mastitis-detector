"""TEMPORARY in-memory storage of the latest uploaded data.
The backend developer replaces this with PostgreSQL."""
from app.schemas import CowData

latest: dict[str, CowData] = {}


def save_latest(cows: list[CowData]) -> None:
    for cow in cows:
        latest[cow.cow_id] = cow