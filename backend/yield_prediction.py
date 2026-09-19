import os
import joblib
import pandas as pd


# ==========================================
# LOAD TRAINED YIELD MODEL
# ==========================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "agrinexa_yield_model.joblib"
)

model_data = joblib.load(MODEL_PATH)

yield_model = model_data["model"]
feature_columns = model_data["feature_columns"]


# ==========================================
# SUPPORTED CROPS
# ==========================================

SUPPORTED_CROPS = [
    "Rice",
    "Maize",
    "Chickpea",
    "Cotton"
]


# ==========================================
# YIELD PREDICTION FUNCTION
# ==========================================

def predict_yield(
    crop,
    area_ha,
    year,
    temperature,
    humidity,
    ph,
    rainfall,
    wind_speed
):

    # --------------------------------------
    # CHECK CROP
    # --------------------------------------

    crop_clean = crop.strip().lower()

    crop_mapping = {
        "rice": "rice",
        "maize": "maize",
        "chickpea": "chickpea",
        "cotton": "cotton",
        "cotton(lint)": "cotton"
    }

    if crop_clean not in crop_mapping:

        return {
            "Status": "Not Available",
            "Message": f"Yield prediction is currently unavailable for {crop}.",
            "Supported_Crops": SUPPORTED_CROPS
        }

    crop_name = crop_mapping[crop_clean]


    # --------------------------------------
    # CREATE INPUT DATA
    # --------------------------------------

    data = {
        "Year": year,
        "Area_ha": area_ha,
        "Temperature_C": temperature,
        "Humidity_%": humidity,
        "pH": ph,
        "Rainfall_mm": rainfall,
        "Wind_Speed_m_s": wind_speed
    }


    # --------------------------------------
    # FEATURE ENGINEERING
    # --------------------------------------

    data["Temp_Humidity"] = (
        temperature * humidity
    )

    data["Temp_Rainfall"] = (
        temperature * rainfall
    )

    data["Humidity_Rainfall"] = (
        humidity * rainfall
    )

    if temperature != 0:

        data["Rainfall_Temp_Ratio"] = (
            rainfall / temperature
        )

    else:

        data["Rainfall_Temp_Ratio"] = 0


    # --------------------------------------
    # CREATE DATAFRAME
    # --------------------------------------

    input_data = pd.DataFrame([data])


    # --------------------------------------
    # ADD CROP ONE-HOT FEATURES
    # --------------------------------------

    for column in feature_columns:

        if column.startswith("Crop_"):

            input_data[column] = 0


    crop_column = f"Crop_{crop_name}"

    if crop_column in input_data.columns:

        input_data[crop_column] = 1


    # --------------------------------------
    # ENSURE SAME FEATURES AS TRAINING
    # --------------------------------------

    input_data = input_data.reindex(
        columns=feature_columns,
        fill_value=0
    )


    # --------------------------------------
    # MAKE PREDICTION
    # --------------------------------------

    prediction = yield_model.predict(
        input_data
    )[0]


    # --------------------------------------
    # RETURN RESULT
    # --------------------------------------

    return {
        "Status": "Success",
        "Crop": crop,
        "Area_ha": area_ha,
        "Predicted_Yield": round(
            float(prediction),
            2
        ),
        "Unit": "dataset yield unit"
    }