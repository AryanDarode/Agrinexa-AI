from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from database import Base, engine
from models import Farmer, FarmRecord
from farmer import router as farmer_router
from otp_service import router as otp_router

from ai_assistant import ask_agrinexa

from weather import get_weather

from crop_recommendation import (
    final_crop_recommendation,
    get_soil_profile_by_color,
    recommend_fertilizer,
    get_current_crop_stage
)

from irrigation import irrigation_recommendation
from pest import pest_disease_advisory
from yield_prediction import predict_yield


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI()


# Farmer API
app.include_router(farmer_router)

# Auth & OTP API
app.include_router(otp_router)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Agrinexa AI Backend is running!"
    }


@app.get("/api/weather")
def weather(city: str):
    return get_weather(city)


@app.get("/api/recommend-crops")
def recommend_crops(
    district: str,
    season: str
):
    result = final_crop_recommendation(
        district,
        season,
        top_n=5
    )

    if isinstance(result, dict):
        return result

    return {
        "Status": "Success",
        "District": district,
        "Season": season,
        "Recommendations": result.to_dict(
            orient="records"
        )
    }


@app.get("/api/soil-profile")
def soil_profile(district: str):

    result = get_soil_profile_by_color(
        district
    )

    if result is None:
        return {
            "Status": "Unavailable",
            "Message": "Soil profile is not available for this district."
        }

    return {
        "Status": "Success",
        "Soil_Profile": result
    }


@app.get("/api/recommend-fertilizer")
def fertilizer_recommendation(
    crop: str,
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    ph: float
):

    result = recommend_fertilizer(
        crop,
        nitrogen,
        phosphorus,
        potassium,
        ph
    )

    return result


@app.get("/api/crop-stage")
def crop_stage(
    crop: str,
    crop_age_days: int
):

    result = get_current_crop_stage(
        crop,
        crop_age_days
    )

    return result


@app.get("/api/irrigation")
def irrigation(
    crop: str,
    crop_stage: str,
    rainfall: float,
    temperature: float,
    humidity: float
):

    result = irrigation_recommendation(
        crop,
        crop_stage,
        rainfall,
        temperature,
        humidity
    )

    return result


@app.get("/api/pest-risk")
def pest_risk(
    crop: str,
    crop_stage: str,
    rainfall: float,
    temperature: float,
    humidity: float
):

    return pest_disease_advisory(
        crop,
        crop_stage,
        rainfall,
        temperature,
        humidity
    )


@app.get("/api/yield-prediction")
def yield_prediction(
    crop: str,
    area_ha: float,
    year: int,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
    wind_speed: float
):

    return predict_yield(
        crop,
        area_ha,
        year,
        temperature,
        humidity,
        ph,
        rainfall,
        wind_speed
    )


class AIRequest(BaseModel):

    question: str

    context: dict = {}

    language: str = "en-IN"


@app.post("/api/ai-assistant")
def ai_assistant(
    request: AIRequest
):

    return ask_agrinexa(
        request.question,
        request.context,
        request.language
    )