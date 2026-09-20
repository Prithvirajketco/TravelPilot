from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from enum import Enum

class PlaceCategory(str, Enum):
    CULTURE = "culture"
    NATURE = "nature"
    FOOD = "food"
    ACTIVITY = "activity"
    LIFESTYLE = "lifestyle"

class TimeWindow(BaseModel):
    dow: List[int] # 1 (Monday) to 7 (Sunday)
    open: str # HH:MM format
    close: str # HH:MM format

class PlaceSource(BaseModel):
    origin: str
    url: Optional[str] = None
    verified_by: Optional[str] = None
    verified_on: Optional[date] = None

class Place(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    category: List[str] # Detailed categories mapping to PlaceCategory broadly
    tags: List[str] = []
    avg_duration_min: int
    cost_per_person: float
    indoor: bool = False
    open_hours: List[TimeWindow]
    closure_dates: List[date] = []
    best_time_of_day: Optional[str] = None
    booking_required: bool = False
    accessibility: Dict[str, Any] = {}
    dietary: List[str] = []
    popularity_score: float = 0.5
    source: Optional[PlaceSource] = None

class Trip(BaseModel):
    id: str
    destination: str
    start_date: date
    end_date: date
    currency: str = "USD"
    party_size: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Interest(BaseModel):
    tag: str
    weight: float

class Constraints(BaseModel):
    trip_id: str
    budget_total: float
    pace: str = "balanced" # relaxed, balanced, packed
    interests: List[Interest] = []
    hotel_location: Optional[str] = None
    dietary: List[str] = []
    mobility: Optional[str] = None
    day_start: str = "09:00"
    day_end: str = "21:00"
    avoid: List[str] = []
    must_include: List[str] = []

class BookingType(str, Enum):
    TRANSPORT = "transport"
    STAY = "stay"
    ACTIVITY = "activity"

class BookingStatus(str, Enum):
    PLANNED = "planned"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    DELAYED = "delayed"

class Booking(BaseModel):
    id: str
    trip_id: str
    type: BookingType
    place_id: Optional[str] = None
    start_dt: datetime
    end_dt: datetime
    cost: float
    status: BookingStatus = BookingStatus.PLANNED
    fixed: bool = False
    details: Dict[str, Any] = {}

class TransitLeg(BaseModel):
    mode: str
    minutes: int
    cost: float

class ItineraryItem(BaseModel):
    day: int
    order: int
    place_id: Optional[str] = None
    booking_id: Optional[str] = None
    start_time: str # HH:MM
    end_time: str # HH:MM
    transit_from_prev: Optional[TransitLeg] = None
    reason: str = ""

class ItineraryVer(BaseModel):
    id: str
    trip_id: str
    version: int
    parent_version: Optional[int] = None
    is_sandbox: bool = False
    created_by_event: Optional[str] = None
    objective_value: float = 0.0
    violations: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    items: List[ItineraryItem] = []

class Event(BaseModel):
    id: str
    trip_id: str
    type: str # flight_cancelled, venue_closed, etc.
    target_id: Optional[str] = None
    payload: Dict[str, Any] = {}
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_version: Optional[int] = None
