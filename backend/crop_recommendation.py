import os
import pandas as pd


# ==========================================
# DATASET PATHS
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_DIR = os.path.join(
    BASE_DIR,
    "..",
    "datasets"
)

CROP_DATASET = os.path.join(
    DATASET_DIR,
    "crop_production_yield.csv"
)

FERTILIZER_DATASET = os.path.join(
    DATASET_DIR,
    "crop_fertilizer.csv"
)


# ==========================================
# LOAD DATASETS
# ==========================================

crop_data = pd.read_csv(CROP_DATASET)

fertilizer = pd.read_csv(FERTILIZER_DATASET)


# ==========================================
# CLEAN COLUMN VALUES
# ==========================================

crop_data["State_Name"] = (
    crop_data["State_Name"]
    .astype(str)
    .str.strip()
)

crop_data["District_Name"] = (
    crop_data["District_Name"]
    .astype(str)
    .str.strip()
)

crop_data["Season"] = (
    crop_data["Season"]
    .astype(str)
    .str.strip()
)

crop_data["Crop"] = (
    crop_data["Crop"]
    .astype(str)
    .str.strip()
)


fertilizer["District_Name"] = (
    fertilizer["District_Name"]
    .astype(str)
    .str.strip()
)

fertilizer["Soil_color"] = (
    fertilizer["Soil_color"]
    .astype(str)
    .str.strip()
)

fertilizer["Crop"] = (
    fertilizer["Crop"]
    .astype(str)
    .str.strip()
)


# ==========================================
# SELECT RELIABLE CROPS
# ==========================================

crop_counts = crop_data["Crop"].value_counts()

reliable_crops = crop_counts[
    crop_counts >= 1000
]


# ==========================================
# REMOVE AGGREGATE / OTHER CATEGORIES
# ==========================================

aggregate_crops = [
    crop
    for crop in reliable_crops.index
    if "total" in crop.lower()
    or crop.lower().startswith("other ")
]


final_crops = [
    crop
    for crop in reliable_crops.index
    if crop not in aggregate_crops
]


# ==========================================
# CREATE MODEL DATA
# ==========================================

crop_model_data = crop_data[
    crop_data["Crop"].isin(final_crops)
].copy()


# ==========================================
# MAHARASHTRA DATA
# ==========================================

maharashtra_data = crop_model_data[
    crop_model_data["State_Name"].str.lower()
    == "maharashtra"
].copy()


# ==========================================
# DISTRICT + SEASON + CROP COUNTS
# ==========================================

district_season_counts = (

    maharashtra_data

    .groupby(
        [
            "District_Name",
            "Season",
            "Crop"
        ]
    )

    .size()

    .reset_index(
        name="Records"
    )
)


# ==========================================
# SUITABILITY PERCENTAGE
# ==========================================

district_season_counts[
    "Suitability_Percentage"
] = (

    district_season_counts["Records"]

    /

    district_season_counts.groupby(
        [
            "District_Name",
            "Season"
        ]
    )["Records"].transform("sum")

) * 100


# ==========================================
# SOIL PROFILE
# ==========================================

def get_soil_profile_by_color(district):

    district_data = fertilizer[
        fertilizer["District_Name"]
        .str.lower()
        == district.strip().lower()
    ].copy()

    if district_data.empty:

        return None

    soil_color = (
        district_data["Soil_color"]
        .mode()[0]
    )

    soil_data = fertilizer[
        fertilizer["Soil_color"]
        .str.lower()
        == soil_color.lower()
    ].copy()

    profile = {

        "District": district,

        "Soil_color": soil_color,

        "Nitrogen": float(
            soil_data["Nitrogen"].median()
        ),

        "Phosphorus": float(
            soil_data["Phosphorus"].median()
        ),

        "Potassium": float(
            soil_data["Potassium"].median()
        ),

        "pH": float(
            soil_data["pH"].median()
        ),

        "Records": len(soil_data),

        "Source": "Regional soil-color profile"
    }

    return profile


# ==========================================
# CROP NAME MAPPING
# ==========================================

crop_name_mapping = {

    "Arhar/Tur": "Tur",

    "Moong(Green Gram)": "Moong",

    "Cotton(lint)": "Cotton",

    "Soyabean": "Soybean",

    "Gram": "Gram",

    "Urad": "Urad",

    "Groundnut": "Groundnut",

    "Rice": "Rice",

    "Maize": "Maize",

    "Jowar": "Jowar",

    "Wheat": "Wheat",

    "Masoor": "Masoor",

    "Sugarcane": "Sugarcane",

    "Ginger": "Ginger",

    "Turmeric": "Turmeric"
}


# ==========================================
# SOIL COMPATIBILITY
# ==========================================

def calculate_soil_compatibility(
    district,
    crop
):

    soil = get_soil_profile_by_color(
        district
    )

    if soil is None:

        return {
            "Status": "Unavailable",
            "Message":
                "Soil profile is not available for this district."
        }


    crop_data = fertilizer[
        fertilizer["Crop"]
        .str.lower()
        == crop.strip().lower()
    ]


    if crop_data.empty:

        return {
            "Status": "Unavailable",
            "Message":
                f"No soil profile available for {crop}."
        }


    crop_profile = {

        "Nitrogen":
            crop_data["Nitrogen"].median(),

        "Phosphorus":
            crop_data["Phosphorus"].median(),

        "Potassium":
            crop_data["Potassium"].median(),

        "pH":
            crop_data["pH"].median()
    }


    def similarity(actual, target):

        if target == 0:

            return (
                100
                if actual == 0
                else 0
            )

        difference = (
            abs(actual - target)
            / target
        )

        score = 100 * (
            1 - difference
        )

        return max(
            0,
            min(100, score)
        )


    nitrogen_score = similarity(
        soil["Nitrogen"],
        crop_profile["Nitrogen"]
    )


    phosphorus_score = similarity(
        soil["Phosphorus"],
        crop_profile["Phosphorus"]
    )


    potassium_score = similarity(
        soil["Potassium"],
        crop_profile["Potassium"]
    )


    ph_score = similarity(
        soil["pH"],
        crop_profile["pH"]
    )


    final_score = (

        nitrogen_score * 0.25

        + phosphorus_score * 0.25

        + potassium_score * 0.25

        + ph_score * 0.25

    )


    return {

        "Status": "Available",

        "Crop": crop,

        "District": district,

        "Soil_color":
            soil["Soil_color"],

        "Score":
            round(final_score, 2),

        "Nitrogen_Score":
            round(nitrogen_score, 2),

        "Phosphorus_Score":
            round(phosphorus_score, 2),

        "Potassium_Score":
            round(potassium_score, 2),

        "pH_Score":
            round(ph_score, 2),

        "Estimated_Soil": {

            "Nitrogen":
                soil["Nitrogen"],

            "Phosphorus":
                soil["Phosphorus"],

            "Potassium":
                soil["Potassium"],

            "pH":
                soil["pH"]
        },

        "Crop_Profile": {

            "Nitrogen":
                round(
                    float(
                        crop_profile["Nitrogen"]
                    ),
                    2
                ),

            "Phosphorus":
                round(
                    float(
                        crop_profile["Phosphorus"]
                    ),
                    2
                ),

            "Potassium":
                round(
                    float(
                        crop_profile["Potassium"]
                    ),
                    2
                ),

            "pH":
                round(
                    float(
                        crop_profile["pH"]
                    ),
                    2
                )
        }
    }


# ==========================================
# GET SOIL SCORE
# ==========================================

def get_soil_score(
    district,
    crop
):

    fertilizer_crop = (
        crop_name_mapping.get(
            crop,
            crop
        )
    )

    result = calculate_soil_compatibility(
        district,
        fertilizer_crop
    )

    if result["Status"] != "Available":

        return None

    return float(
        result["Score"]
    )


# ==========================================
# FINAL CROP RECOMMENDATION
# ==========================================

def final_crop_recommendation(
    district,
    season,
    top_n=5
):

    data = district_season_counts[
        (
            district_season_counts[
                "District_Name"
            ].str.lower()
            == district.strip().lower()
        )
        &
        (
            district_season_counts[
                "Season"
            ].str.lower()
            == season.strip().lower()
        )
    ].copy()


    if data.empty:

        return {

            "Status": "Error",

            "Message":
                "No historical data found for this district and season."
        }


    results = []


    for _, row in data.iterrows():

        crop = row["Crop"]

        historical_score = float(
            row["Suitability_Percentage"]
        )


        soil_score = get_soil_score(
            district,
            crop
        )


        if soil_score is None:

            final_score = (
                historical_score
            )

            soil_status = "Unavailable"

        else:

            final_score = (

                historical_score * 0.70

                + soil_score * 0.30

            )

            soil_status = "Available"


        results.append({

            "Crop": crop,

            "Historical_Score":
                round(
                    historical_score,
                    2
                ),

            "Soil_Score":
                (
                    round(
                        soil_score,
                        2
                    )
                    if soil_score is not None
                    else None
                ),

            "Soil_Status":
                soil_status,

            "Final_Score":
                round(
                    final_score,
                    2
                )
        })


    result = pd.DataFrame(
        results
    )


    result = (
        result
        .sort_values(
            "Final_Score",
            ascending=False
        )
        .head(top_n)
        .reset_index(drop=True)
    )


    return result


# ==========================================
# TEST MESSAGE
# ==========================================

print(
    "Agrinexa crop recommendation module loaded."
)

print(
    "Final crops:",
    len(final_crops)
)

print(
    "Maharashtra records:",
    len(maharashtra_data)
)

# ==========================================
# FERTILIZER N-P-K COMPOSITION
# ==========================================

fertilizer_composition = {
    "Urea": {"N": 46, "P": 0, "K": 0},
    "DAP": {"N": 18, "P": 46, "K": 0},
    "MOP": {"N": 0, "P": 0, "K": 60},
    "SSP": {"N": 0, "P": 16, "K": 0},

    "10:10:10 NPK": {"N": 10, "P": 10, "K": 10},
    "10:26:26 NPK": {"N": 10, "P": 26, "K": 26},
    "12:32:16 NPK": {"N": 12, "P": 32, "K": 16},
    "13:32:26 NPK": {"N": 13, "P": 32, "K": 26},
    "18:46:00 NPK": {"N": 18, "P": 46, "K": 0},
    "19:19:19 NPK": {"N": 19, "P": 19, "K": 19},
    "20:20:20 NPK": {"N": 20, "P": 20, "K": 20},
    "50:26:26 NPK": {"N": 50, "P": 26, "K": 26},

    "Ammonium Sulphate": {"N": 21, "P": 0, "K": 0},

    "Chilated Micronutrient": {"N": 0, "P": 0, "K": 0},
    "Ferrous Sulphate": {"N": 0, "P": 0, "K": 0},
    "Hydrated Lime": {"N": 0, "P": 0, "K": 0},
    "Magnesium Sulphate": {"N": 0, "P": 0, "K": 0},
    "Sulphur": {"N": 0, "P": 0, "K": 0},
    "White Potash": {"N": 0, "P": 0, "K": 0}
}


# ==========================================
# AGRINEXA - SOIL NUTRIENT STATUS
# ==========================================

def assess_soil(
    crop,
    nitrogen,
    phosphorus,
    potassium,
    ph
):

    crop_data = fertilizer[
        fertilizer["Crop"].astype(str).str.strip().str.lower()
        == crop.strip().lower()
    ]

    if crop_data.empty:

        return {
            "Status": "Unavailable",
            "Message": "Crop not available in fertilizer dataset."
        }


    # Calculate average nutrient values
    n_avg = crop_data["Nitrogen"].mean()
    p_avg = crop_data["Phosphorus"].mean()
    k_avg = crop_data["Potassium"].mean()
    ph_avg = crop_data["pH"].mean()


    # Compare farmer soil with crop averages
    def status(value, average):

        if value < 0.8 * average:
            return "Low"

        elif value > 1.2 * average:
            return "High"

        else:
            return "Adequate"


    n_status = status(nitrogen, n_avg)
    p_status = status(phosphorus, p_avg)
    k_status = status(potassium, k_avg)


    # pH assessment
    if ph < ph_avg - 0.5:

        ph_status = "Low"

    elif ph > ph_avg + 0.5:

        ph_status = "High"

    else:

        ph_status = "Suitable"


    return {
        "Status": "Available",
        "Crop": crop,
        "Nitrogen": n_status,
        "Phosphorus": p_status,
        "Potassium": k_status,
        "pH": ph_status
    }


# ==========================================
# AGRINEXA - FERTILIZER RECOMMENDATION
# ==========================================

def recommend_fertilizer(
    crop,
    nitrogen,
    phosphorus,
    potassium,
    ph
):

    # Check crop
    crop_rows = fertilizer[
        fertilizer["Crop"].astype(str).str.strip().str.lower()
        == crop.strip().lower()
    ]

    if crop_rows.empty:

        return {
            "Status": "Unavailable",
            "Message": "Crop not available in fertilizer dataset."
        }


    # Assess soil
    soil = assess_soil(
        crop,
        nitrogen,
        phosphorus,
        potassium,
        ph
    )


    if soil["Status"] != "Available":

        return soil


    # Get available fertilizers for this crop
    available = (
        crop_rows["Fertilizer"]
        .dropna()
        .astype(str)
        .str.strip()
        .unique()
    )


    deficiencies = []


    if soil["Nitrogen"] == "Low":
        deficiencies.append("N")


    if soil["Phosphorus"] == "Low":
        deficiencies.append("P")


    if soil["Potassium"] == "Low":
        deficiencies.append("K")


    # No major N/P/K deficiency
    if not deficiencies:

        return {
            "Status": "Success",
            "Crop": crop,
            "Soil_Status": soil,
            "Recommendation": "No major N/P/K deficiency detected.",
            "Available_Fertilizers": list(available)
        }


    # Score fertilizers
    recommendations = []


    for fert in available:

        composition = fertilizer_composition.get(fert)


        if composition is None:
            continue


        score = 0
        nutrients = []


        if (
            "N" in deficiencies
            and composition["N"] > 0
        ):

            score += 1
            nutrients.append("N")


        if (
            "P" in deficiencies
            and composition["P"] > 0
        ):

            score += 1
            nutrients.append("P")


        if (
            "K" in deficiencies
            and composition["K"] > 0
        ):

            score += 1
            nutrients.append("K")


        if score > 0:

            recommendations.append(
                {
                    "Fertilizer": fert,
                    "Score": score,
                    "Addresses": nutrients
                }
            )


    recommendations.sort(
        key=lambda x: x["Score"],
        reverse=True
    )


    return {
        "Status": "Success",
        "Crop": crop,
        "Soil_Status": soil,
        "Deficiencies": deficiencies,
        "Recommendations": recommendations
    }
    
    # ==========================================
# CROP STAGE INTELLIGENCE
# ==========================================

import os


# Load crop knowledge dataset
crop_knowledge_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "datasets",
    "crop_knowledge.csv"
)

crop_knowledge = pd.read_csv(
    crop_knowledge_path
)


# Clean column names
crop_knowledge.columns = (
    crop_knowledge.columns
    .astype(str)
    .str.strip()
)


# Clean crop names
crop_knowledge["Crop"] = (
    crop_knowledge["Crop"]
    .astype(str)
    .str.strip()
)


# ==========================================
# GET CURRENT CROP STAGE
# ==========================================

def get_current_crop_stage(crop, crop_age_days):

    crop_data = crop_knowledge[
        crop_knowledge["Crop"].str.lower()
        == crop.strip().lower()
    ].copy()


    # Crop not available
    if crop_data.empty:

        return {
            "Status": "Unavailable",
            "Message": f"No crop-stage information available for {crop}."
        }


    # Find stage using crop age
    stage_data = crop_data[
        (crop_data["Start_Day"] <= crop_age_days)
        &
        (crop_data["End_Day"] >= crop_age_days)
    ].copy()


    # Stage not found
    if stage_data.empty:

        return {
            "Status": "Unavailable",
            "Crop": crop,
            "Crop_Age_Days": crop_age_days,
            "Message": "Crop age is outside the available stage range."
        }


    # Take matching stage
    stage = stage_data.iloc[0]


    return {
        "Status": "Success",
        "Crop": stage["Crop"],
        "Crop_Age_Days": crop_age_days,
        "Stage": stage["Stage"],
        "Start_Day": int(stage["Start_Day"]),
        "End_Day": int(stage["End_Day"]),
        "Stage_Action": stage["Stage_Action"]
    }


# ==========================================
# CALCULATE CROP AGE
# ==========================================

def calculate_crop_age(sowing_date):

    from datetime import date, datetime


    if isinstance(sowing_date, str):

        sowing_date = datetime.strptime(
            sowing_date,
            "%Y-%m-%d"
        ).date()


    today = date.today()

    crop_age = (
        today - sowing_date
    ).days


    return max(0, crop_age)

# ==========================================
# PEST / DISEASE RISK ADVISORY
# ==========================================

def pest_disease_advisory(
    crop,
    crop_stage,
    rainfall,
    temperature,
    humidity
):

    risk_score = 0

    # High humidity can increase pest/disease risk
    if humidity >= 75:
        risk_score += 2
    elif humidity >= 60:
        risk_score += 1

    # Rainfall can increase disease pressure
    if rainfall >= 20:
        risk_score += 2
    elif rainfall >= 5:
        risk_score += 1

    # Higher temperature can increase pest activity
    if temperature >= 30:
        risk_score += 2
    elif temperature >= 25:
        risk_score += 1

    # Convert score into risk level
    if risk_score >= 5:
        risk = "High"
        advice = (
            "High pest or disease risk. "
            "Monitor the crop closely and inspect leaves and stems."
        )

    elif risk_score >= 3:
        risk = "Medium"
        advice = (
            "Moderate pest or disease risk. "
            "Inspect the crop regularly and monitor for symptoms."
        )

    else:
        risk = "Low"
        advice = (
            "Low pest or disease risk. "
            "Continue monitoring the crop."
        )

    return {
        "Status": "Success",
        "Crop": crop,
        "Crop_Stage": crop_stage,
        "Rainfall_mm": rainfall,
        "Temperature_C": temperature,
        "Humidity_%": humidity,
        "Pest_Risk": risk,
        "Advice": advice
    }