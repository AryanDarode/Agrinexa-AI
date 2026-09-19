# ==========================================
# AGRINEXA AI - IRRIGATION RECOMMENDATION
# ==========================================


def irrigation_recommendation(
    crop,
    crop_stage,
    rainfall,
    temperature,
    humidity
):

    # Convert values to numbers
    rainfall = float(rainfall)
    temperature = float(temperature)
    humidity = float(humidity)

    # --------------------------------------
    # Check rainfall
    # --------------------------------------

    if rainfall > 5:
        priority = "Low"
        advice = "Recent rainfall is sufficient. Monitor soil moisture before irrigation."

    elif rainfall > 1:
        priority = "Medium"
        advice = "Some rainfall has occurred. Check soil moisture before irrigating."

    else:
        # ----------------------------------
        # No significant rainfall
        # ----------------------------------

        if temperature >= 30 and humidity < 50:
            priority = "High"
            advice = "High irrigation priority. Check soil moisture and irrigate if the soil is dry."

        elif temperature >= 25 and humidity < 60:
            priority = "Medium"
            advice = "Moderate irrigation requirement. Check soil moisture and irrigate if needed."

        else:
            priority = "Low"
            advice = "Low immediate irrigation priority. Continue monitoring soil moisture."

    return {
        "Status": "Success",
        "Crop": crop,
        "Crop_Stage": crop_stage,
        "Rainfall_mm": rainfall,
        "Temperature_C": temperature,
        "Humidity_%": humidity,
        "Irrigation_Priority": priority,
        "Advice": advice
    }