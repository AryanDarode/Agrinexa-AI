# 🌱 Agrinexa AI

### An AI-Powered Climate-Smart Farming Decision Support System for Sustainable Agriculture

> **Smarter Farms. Better Futures.**

Agrinexa AI is an intelligent agriculture decision-support platform designed to help farmers make better farming decisions using agricultural data, weather information, machine learning, and AI.

Instead of providing only raw agricultural information, Agrinexa converts multiple data sources into practical and understandable farming recommendations.

---

## 🎯 Problem Statement

Farmers often need to make important decisions related to:

- Which crop should be grown?
- When should the crop be sown?
- What is the current weather condition?
- What type of soil is suitable?
- Which fertilizer should be used?
- When should irrigation be done?
- What is the current crop growth stage?
- What is the risk of pests and diseases?
- What yield can be expected?

These decisions often require information from different sources.

### Agrinexa AI brings these decisions together in one platform.

---

## 💡 Our Solution

Agrinexa AI combines:

- 🌦️ Live weather data
- 🌱 Historical crop production data
- 🧪 Regional soil information
- 🧠 Machine Learning models
- 🌾 Fertilizer recommendations
- 💧 Irrigation advisory
- 🐛 Pest and disease risk analysis
- 📅 Crop-stage intelligence
- 📊 Yield prediction
- 🤖 AI agricultural assistant

The goal is to provide farmers with **simple, actionable and understandable recommendations**.

---

## 🚀 Key Features

### 🌦️ Live Weather

Provides current weather information using the OpenWeather API.

Information includes:

- Temperature
- Humidity
- Wind speed
- Current rainfall
- Cloud percentage
- Weather condition

---

### 🌱 Crop Recommendation

Agrinexa analyzes historical agricultural production data to recommend suitable crops based on:

- District
- Season
- Historical crop occurrence
- Regional soil compatibility

The recommendation combines historical crop records with available regional soil information.

---

### 🧪 Soil Profile

Agrinexa provides an estimated regional soil profile using agricultural fertilizer/soil data.

The system can estimate:

- Soil type
- Nitrogen
- Phosphorus
- Potassium
- pH

> **Note:** The regional soil profile is an estimate and should not replace laboratory soil testing.

---

### 🌾 Fertilizer Recommendation

Agrinexa analyzes soil nutrient conditions and available fertilizer information to suggest suitable fertilizer options.

The system considers:

- Nitrogen
- Phosphorus
- Potassium
- pH
- Crop requirements

---

### 📅 Crop Stage Intelligence

Farmers can provide their crop and sowing date.

Agrinexa calculates the approximate crop age and identifies the current growth stage.

It can provide actions related to:

- Vegetative growth
- Flowering
- Fruiting/grain development
- Crop monitoring
- Nutrient requirements

---

### 💧 Irrigation Advisory

Agrinexa provides irrigation guidance using:

- Crop
- Crop growth stage
- Rainfall
- Temperature
- Humidity

The system provides an irrigation priority and practical guidance.

---

### 🐛 Pest & Disease Risk

Agrinexa estimates pest and disease risk using environmental conditions such as:

- Humidity
- Rainfall
- Temperature
- Crop stage

The system provides:

- Risk level
- Monitoring advice
- Preventive guidance

---

### 📊 Yield Prediction

A machine learning model is used to estimate crop yield for supported crops.

Current supported crops include:

- Rice
- Maize
- Chickpea
- Cotton

The model uses environmental and farm-related features such as:

- Area
- Year
- Temperature
- Humidity
- pH
- Rainfall
- Wind speed
- Engineered weather features

Model:

**XGBoost Regressor**

Current evaluation:

| Metric | Value |
|---|---:|
| MAE | ~372.81 |
| RMSE | ~529.84 |
| R² | ~0.56 |

> Model performance depends on the dataset and input conditions. The prediction should be treated as a decision-support estimate, not a guaranteed yield.

---

## 🤖 AI Agricultural Assistant

Agrinexa includes an AI assistant that allows farmers to interact with the system using natural language.

The assistant can connect conversational AI with Agrinexa's agricultural modules.

### Architecture

```text
Farmer
   ↓
Text / Voice Input
   ↓
AI Assistant
   ↓
Agrinexa Agricultural Tools
   ├── Weather
   ├── Crop Recommendation
   ├── Soil Profile
   ├── Fertilizer
   ├── Crop Stage
   ├── Irrigation
   ├── Pest Risk
   └── Yield Prediction
   ↓
Agricultural Result
   ↓
Simple Farmer-Friendly Explanation
