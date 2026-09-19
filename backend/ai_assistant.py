import os
import json
import base64
import io
import wave

from google import genai
from google.genai import types

from dotenv import load_dotenv

from weather import get_weather

from crop_recommendation import (
    final_crop_recommendation,
    get_soil_profile_by_color
)

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=api_key
)


SYSTEM_INSTRUCTION = """
You are Agrinexa AI, a friendly agricultural assistant.

Your job is to help farmers make practical farming decisions
using Agrinexa's agricultural information and tools.

IMPORTANT:

1. First understand what the farmer is asking.

2. Focus your answer on the topic of the question.

3. Do not give a complete farm report for a simple question.

4. Use the farmer's current context whenever it is relevant.

5. Use Agrinexa tools when actual weather, soil or crop
   information is required.

6. Never invent agricultural data.

7. If information is unavailable, clearly say that it is
   unavailable.

8. Keep normal answers short and practical.

9. Usually answer in 2 to 5 sentences.

10. Give clear actions when appropriate.

11. For irrigation questions, focus on irrigation conditions,
    rainfall, humidity, temperature and available irrigation
    information.

12. For fertilizer questions, focus on nutrient deficiencies
    and available fertilizer recommendations.

13. For pest or disease questions, focus on risk and
    monitoring/prevention actions.

14. For crop-stage questions, focus on crop age, current stage
    and stage-specific action.

15. For yield questions, focus on the predicted yield and
    explain that it is a model estimate.

16. Only provide an overall farm summary when the farmer
    asks about the overall farm condition.

17. Do not unnecessarily repeat information.

18. The farmer may communicate in English, Hindi or Marathi.
    Respond in the same language when possible.

19. Do not claim that a recommendation guarantees success.

20. Soil information may be a regional estimate and should
    not replace laboratory soil testing.

21. You are supporting the farmer's decision-making and do
    not replace agricultural experts.
"""


def agrinexa_weather(city: str) -> dict:
    result = get_weather(city)

    if result is None:
        return {
            "Status": "Unavailable",
            "Message": f"Weather data is unavailable for {city}."
        }

    return result


def agrinexa_soil_profile(district: str) -> dict:
    result = get_soil_profile_by_color(district)

    if result is None:
        return {
            "Status": "Unavailable",
            "Message": f"Soil profile is unavailable for {district}."
        }

    return result


def agrinexa_crop_recommendation(
    district: str,
    season: str
) -> dict:

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


def agrinexa_farm_context(topic: str, context: dict) -> dict:

    topic = topic.lower()

    if topic == "irrigation":
        return {
            "Topic": "Irrigation",
            "Weather": context.get("weather"),
            "Crop_Stage": context.get("crop_stage"),
            "Irrigation": context.get("irrigation")
        }

    if topic == "pest":
        return {
            "Topic": "Pest and Disease",
            "Weather": context.get("weather"),
            "Crop_Stage": context.get("crop_stage"),
            "Pest_Disease": context.get("pest_disease")
        }

    if topic == "fertilizer":
        return {
            "Topic": "Fertilizer",
            "Soil": context.get("soil"),
            "Crop": context.get("farmer", {}).get("crop")
        }

    if topic == "crop_stage":
        return {
            "Topic": "Crop Stage",
            "Crop": context.get("farmer", {}).get("crop"),
            "Crop_Stage": context.get("crop_stage")
        }

    if topic == "yield":
        return {
            "Topic": "Yield Prediction",
            "Crop": context.get("farmer", {}).get("crop"),
            "Yield": context.get("yield_prediction")
        }

    if topic == "soil":
        return {
            "Topic": "Soil",
            "District": context.get("farmer", {}).get("district"),
            "Soil": context.get("soil")
        }

    if topic == "weather":
        return {
            "Topic": "Weather",
            "Weather": context.get("weather")
        }

    return {
        "Topic": "Overall Farm",
        "Farmer": context.get("farmer"),
        "Weather": context.get("weather"),
        "Soil": context.get("soil"),
        "Crop_Stage": context.get("crop_stage"),
        "Irrigation": context.get("irrigation"),
        "Pest_Disease": context.get("pest_disease"),
        "Yield": context.get("yield_prediction")
    }


def generate_voice_audio(text, language):

    language_names = {
        "en-IN": "English",
        "hi-IN": "Hindi",
        "mr-IN": "Marathi"
    }

    language_name = language_names.get(
        language,
        "English"
    )

    speech_prompt = f"""
Speak the following Agrinexa AI answer naturally in
{language_name}.

Use a warm, friendly and clear tone suitable for a farmer.

Speak numbers, temperatures and percentages naturally.
Do not sound robotic.
Do not add extra information.
Only speak the provided answer.

Answer:
{text}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-tts-preview",
        contents=speech_prompt,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                language_code=language,
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name="Kore"
                    )
                )
            )
        )
    )

    audio_data = (
        response
        .candidates[0]
        .content
        .parts[0]
        .inline_data
        .data
    )

    # Gemini TTS returns raw PCM audio.
    # Convert it into WAV so the browser can play it.

    wav_buffer = io.BytesIO()

    with wave.open(wav_buffer, "wb") as wav_file:

        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(24000)

        wav_file.writeframes(audio_data)

    wav_bytes = wav_buffer.getvalue()

    return base64.b64encode(wav_bytes).decode("utf-8")


def ask_agrinexa(question, context=None, language="en-IN"):

    if not question or not question.strip():
        return {
            "Status": "Error",
            "Message": "Please enter a question."
        }

    if context is None:
        context = {}

    try:

        context_json = json.dumps(
            context,
            indent=2
        )

        prompt = f"""
Current farmer information:

{context_json}

Farmer question:

{question}

Use the available Agrinexa information to answer the
farmer's question.

Important:
- Answer the exact question first.
- Do not give an unnecessary complete farm report.
- Keep the answer practical and concise.
"""

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.4,
                max_output_tokens=500,
                tools=[
                    agrinexa_weather,
                    agrinexa_soil_profile,
                    agrinexa_crop_recommendation
                ]
            )
        )

        answer = response.text

        audio_base64 = generate_voice_audio(
            answer,
            language
        )

        return {
            "Status": "Success",
            "Answer": answer,
            "Audio": audio_base64,
            "Audio_Format": "audio/wav",
            "Language": language
        }

    except Exception as error:

        print("Gemini error:", error)

        return {
            "Status": "Error",
            "Message": "Agrinexa AI could not process your question."
        }