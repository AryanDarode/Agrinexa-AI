def pest_disease_advisory(
    crop,
    crop_stage,
    rainfall,
    temperature,
    humidity
):

    crop = crop.strip().lower()
    crop_stage = crop_stage.strip().lower()

    risk_score = 0

    # High humidity can increase pest/disease risk
    if humidity >= 80:
        risk_score += 2
    elif humidity >= 65:
        risk_score += 1

    # Rainfall can increase disease-favorable conditions
    if rainfall >= 20:
        risk_score += 2
    elif rainfall >= 5:
        risk_score += 1

    # Warm temperature can increase pest activity
    if 25 <= temperature <= 35:
        risk_score += 1

    # Crop-stage consideration
    if "vegetative" in crop_stage:
        risk_score += 0

    elif "flowering" in crop_stage:
        risk_score += 1

    elif "fruit" in crop_stage or "grain" in crop_stage:
        risk_score += 1

    # Determine risk
    if risk_score >= 5:
        risk = "High"
        advice = (
            "High pest and disease risk. "
            "Monitor the crop closely for visible symptoms "
            "and follow integrated pest management practices."
        )

    elif risk_score >= 3:
        risk = "Medium"
        advice = (
            "Moderate pest and disease risk. "
            "Inspect leaves, stems and crop growth regularly."
        )

    else:
        risk = "Low"
        advice = (
            "Low pest and disease risk. "
            "Continue regular crop monitoring."
        )

    return {
        "Status": "Success",
        "Crop": crop,
        "Crop_Stage": crop_stage,
        "Rainfall_mm": rainfall,
        "Temperature_C": temperature,
        "Humidity_%": humidity,
        "Pest_Disease_Risk": risk,
        "Advice": advice
    }