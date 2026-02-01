from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    start_time: datetime
    end_time: datetime


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: str


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


app = FastAPI(title="Master K8s Events API", version="0.1.0")

allowed_origins = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

EVENTS: Dict[str, Event] = {}


@app.get("/healthz")
async def healthz() -> dict:
    return {"status": "ok"}


@app.get("/readyz")
async def readyz() -> dict:
    return {"status": "ready"}


@app.get("/events", response_model=List[Event])
async def list_events() -> List[Event]:
    return list(EVENTS.values())


@app.post("/events", response_model=Event, status_code=201)
async def create_event(payload: EventCreate) -> Event:
    event_id = str(uuid4())
    event = Event(id=event_id, **payload.dict())
    EVENTS[event_id] = event
    return event


@app.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str) -> Event:
    event = EVENTS.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, payload: EventUpdate) -> Event:
    existing = EVENTS.get(event_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    updated = existing.dict()
    for k, v in payload.dict(exclude_unset=True).items():
        updated[k] = v
    EVENTS[event_id] = Event(**updated)
    return EVENTS[event_id]


@app.delete("/events/{event_id}", status_code=204)
async def delete_event(event_id: str) -> None:
    if event_id not in EVENTS:
        raise HTTPException(status_code=404, detail="Event not found")
    del EVENTS[event_id]
    return None
