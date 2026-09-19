from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from sqlalchemy.orm import Session

from database import SessionLocal
from models import Farmer, FarmRecord


router = APIRouter(
    prefix="/api/farmers",
    tags=["Farmers"]
)


# -----------------------------
# Farmer Profile Models
# -----------------------------

class FarmerCreate(BaseModel):

    farmer_name: str
    mobile: str
    location: str
    area: float
    season: str
    crop: str
    sowing_date: date


class FarmerResponse(BaseModel):

    id: int
    farmer_name: str
    mobile: str
    location: str
    area: float
    season: str
    crop: str
    sowing_date: date

    class Config:
        from_attributes = True


# -----------------------------
# Farm Record Models
# -----------------------------

class FarmRecordCreate(BaseModel):

    crop: str
    season: str
    area: float
    sowing_date: date
    year: int


class FarmRecordResponse(BaseModel):

    id: int
    farmer_id: int
    crop: str
    season: str
    area: float
    sowing_date: date
    year: int

    class Config:
        from_attributes = True


# -----------------------------
# Create Farmer
# -----------------------------

@router.post(
    "",
    response_model=FarmerResponse
)
def create_farmer(
    farmer_data: FarmerCreate
):

    db: Session = SessionLocal()

    try:

        farmer = Farmer(
            farmer_name=farmer_data.farmer_name,
            mobile=farmer_data.mobile,
            location=farmer_data.location,
            area=farmer_data.area,
            season=farmer_data.season,
            crop=farmer_data.crop,
            sowing_date=farmer_data.sowing_date
        )

        db.add(farmer)
        db.commit()
        db.refresh(farmer)

        return farmer

    finally:
        db.close()


# -----------------------------
# Get Farmer
# -----------------------------

@router.get(
    "/{farmer_id}",
    response_model=FarmerResponse
)
def get_farmer(
    farmer_id: int
):

    db: Session = SessionLocal()

    try:

        farmer = (
            db.query(Farmer)
            .filter(Farmer.id == farmer_id)
            .first()
        )

        if farmer is None:
            raise HTTPException(
                status_code=404,
                detail="Farmer not found."
            )

        return farmer

    finally:
        db.close()


# -----------------------------
# Update Farmer
# -----------------------------

@router.put(
    "/{farmer_id}",
    response_model=FarmerResponse
)
def update_farmer(
    farmer_id: int,
    farmer_data: FarmerCreate
):

    db: Session = SessionLocal()

    try:

        farmer = (
            db.query(Farmer)
            .filter(Farmer.id == farmer_id)
            .first()
        )

        if farmer is None:
            raise HTTPException(
                status_code=404,
                detail="Farmer not found."
            )

        farmer.farmer_name = farmer_data.farmer_name
        farmer.mobile = farmer_data.mobile
        farmer.location = farmer_data.location
        farmer.area = farmer_data.area
        farmer.season = farmer_data.season
        farmer.crop = farmer_data.crop
        farmer.sowing_date = farmer_data.sowing_date

        db.commit()
        db.refresh(farmer)

        return farmer

    finally:
        db.close()


# -----------------------------
# Add Farm Record
# -----------------------------

@router.post(
    "/{farmer_id}/records",
    response_model=FarmRecordResponse
)
def create_farm_record(
    farmer_id: int,
    record_data: FarmRecordCreate
):

    db: Session = SessionLocal()

    try:

        farmer = (
            db.query(Farmer)
            .filter(Farmer.id == farmer_id)
            .first()
        )

        if farmer is None:
            raise HTTPException(
                status_code=404,
                detail="Farmer not found."
            )

        farm_record = FarmRecord(
            farmer_id=farmer_id,
            crop=record_data.crop,
            season=record_data.season,
            area=record_data.area,
            sowing_date=record_data.sowing_date,
            year=record_data.year
        )

        db.add(farm_record)
        db.commit()
        db.refresh(farm_record)

        return farm_record

    finally:
        db.close()


# -----------------------------
# Get Farm History
# -----------------------------

@router.get(
    "/{farmer_id}/records",
    response_model=list[FarmRecordResponse]
)
def get_farm_records(
    farmer_id: int
):

    db: Session = SessionLocal()

    try:

        farmer = (
            db.query(Farmer)
            .filter(Farmer.id == farmer_id)
            .first()
        )

        if farmer is None:
            raise HTTPException(
                status_code=404,
                detail="Farmer not found."
            )

        records = (
            db.query(FarmRecord)
            .filter(FarmRecord.farmer_id == farmer_id)
            .order_by(FarmRecord.year.desc())
            .all()
        )

        return records

    finally:
        db.close()