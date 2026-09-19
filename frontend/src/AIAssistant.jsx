import React, { useState, useRef, useEffect } from "react";
import Card from "./components/common/Card";
import Button from "./components/common/Button";
import translations from "./translations";
import {
  BotIcon,
  MicIcon,
  SendIcon,
  VolumeIcon,
  VolumeXIcon,
  XIcon,
  SparklesIcon,
  LeafIcon
} from "./components/common/Icons";

export default function AIAssistant({
  farmerDetails,
  weather,
  soilProfile,
  cropStage,
  irrigationData,
  pestData,
  yieldData,
  appLanguage = "en",
  isOpen = false,
  onClose
}) {
  const t = translations[appLanguage] || translations.en;

  const initialGreeting =
    appLanguage === "hi"
      ? `नमस्ते ${farmerDetails?.farmerName || ""}! 🌱 मैं एग्रीनेक्सा एआई (Agrinexa AI) हूँ। आपके खेत के लिए मैं क्या सहायता कर सकता हूँ?`
      : appLanguage === "mr"
      ? `नमस्कार ${farmerDetails?.farmerName || ""}! 🌱 मी अ‍ॅग्रीनेक्सा एआय (Agrinexa AI) आहे. आज आपल्या शेतीसाठी मी कशी मदत करू शकेन?`
      : `Namaste ${farmerDetails?.farmerName ? farmerDetails.farmerName.split(" ")[0] : ""}! 🌱 I am Agrinexa AI, grounded in your live farm data. How can I help you today?`;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: initialGreeting
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // Map appLanguage to speech recognition locale
  const getSpeechLang = () => {
    if (appLanguage === "hi") return "hi-IN";
    if (appLanguage === "mr") return "mr-IN";
    return "en-IN";
  };

  const starterPrompts = [
    appLanguage === "hi"
      ? "क्या आज मेरी फसल को पानी देना चाहिए?"
      : appLanguage === "mr"
      ? "आज माझ्या पिकाला पाणी द्यावे का?"
      : "Should I irrigate my crop today?",
    appLanguage === "hi"
      ? "मेरी फसल के लिए कौन सा उर्वरक सही है?"
      : appLanguage === "mr"
      ? "माझ्या पिकासाठी कोणते खत योग्य आहे?"
      : "What fertilizer dosage is recommended?",
    appLanguage === "hi"
      ? "कीट और रोगों से बचाव के क्या उपाय हैं?"
      : appLanguage === "mr"
      ? "कीड व रोगांपासून संरक्षणासाठी काय करावे?"
      : "How do I prevent pest attacks?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle playing base64 audio
  const playAudio = (base64Audio, msgIndex) => {
    if (!base64Audio) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      if (playingAudioIndex === msgIndex) {
        setPlayingAudioIndex(null);
        return;
      }
    }

    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audioRef.current = audio;
      setPlayingAudioIndex(msgIndex);

      audio.onended = () => {
        setPlayingAudioIndex(null);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error("Audio error:", e);
        setPlayingAudioIndex(null);
        audioRef.current = null;
      };

      audio.play().catch((err) => {
        console.error("Audio playback error:", err);
        setPlayingAudioIndex(null);
      });
    } catch (err) {
      console.error("Audio setup error:", err);
      setPlayingAudioIndex(null);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        appLanguage === "hi"
          ? "आपके ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया Google Chrome का उपयोग करें।"
          : "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getSpeechLang();

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setListening(false);
    }
  };

  // Send message to AI endpoint
  const sendMessage = async (customPrompt) => {
    const questionText = typeof customPrompt === "string" ? customPrompt : input.trim();
    if (!questionText || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: questionText }]);
    setInput("");
    setLoading(true);

    try {
      const context = {
        farmer: {
          name: farmerDetails?.farmerName || "",
          district: farmerDetails?.location || "",
          crop: farmerDetails?.crop || "",
          area: farmerDetails?.area || "",
          sowingDate: farmerDetails?.sowingDate || ""
        },
        weather: weather
          ? {
              location: weather.Location || farmerDetails?.location,
              temperature_c: weather.Temperature_C,
              humidity_percent: weather["Humidity_%"] || weather.Humidity,
              rainfall_mm: weather.Rainfall_mm || 0,
              wind_speed_m_s: weather.Wind_Speed_m_s || 0,
              condition: weather.Condition
            }
          : null,
        soil: soilProfile
          ? {
              soil_color: soilProfile.Soil_color,
              nitrogen: soilProfile.Nitrogen,
              phosphorus: soilProfile.Phosphorus,
              potassium: soilProfile.Potassium,
              ph: soilProfile.pH
            }
          : null,
        crop_stage: cropStage
          ? {
              crop: cropStage.Crop,
              age_days: cropStage.Crop_Age_Days,
              stage: cropStage.Crop_Stage,
              action: cropStage.Stage_Action
            }
          : null,
        irrigation: irrigationData || null,
        pest_disease: pestData
          ? {
              risk: pestData.Pest_Disease_Risk,
              advice: pestData.Advice
            }
          : null,
        yield_prediction: yieldData || null
      };

      const res = await fetch("http://127.0.0.1:8000/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          context: context,
          language: getSpeechLang()
        })
      });

      if (!res.ok) {
        throw new Error("AI assistant response error");
      }

      const data = await res.json();
      const assistantMsg = {
        role: "assistant",
        text: data.Answer || data.answer || "I have analyzed your farm conditions.",
        audio: data.Audio || data.audio || null
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically play audio if returned
      if (assistantMsg.audio) {
        playAudio(assistantMsg.audio, messages.length + 1);
      }
    } catch (err) {
      console.error("AI Assistant error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            appLanguage === "hi"
              ? "क्षमा करें, वर्तमान में सर्वर से संपर्क नहीं हो पा रहा है। कृपया पुनः प्रयास करें।"
              : appLanguage === "mr"
              ? "क्षमस्व, सध्या सर्व्हरशी संपर्क होत नाही आहे. कृपया पुन्हा प्रयत्न करा."
              : "I apologize, I'm currently unable to reach the agricultural intelligence engine. Please try again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-overlay" onClick={onClose}>
      <div
        className="ai-assistant-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-drawer-title"
      >
        {/* Assistant Header */}
        <div className="ai-drawer-header">
          <div className="ai-header-brand">
            <div className="ai-avatar-circle">
              <BotIcon size={22} />
            </div>
            <div>
              <h3 id="ai-drawer-title" className="ai-header-title">
                {t.appName || "Agrinexa AI"}
              </h3>
              <div className="ai-grounded-badge">
                <span className="ai-pulse-dot" />
                <span>
                  {farmerDetails?.crop ? `${farmerDetails.crop} • ` : ""}
                  {farmerDetails?.location || "Live Farm Context Active"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Assistant"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="ai-chat-messages">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isPlaying = playingAudioIndex === idx;

            return (
              <div
                key={idx}
                className={`ai-message-row ${isUser ? "user-row" : "assistant-row"}`}
              >
                {!isUser && (
                  <div className="ai-bubble-avatar">
                    <BotIcon size={16} />
                  </div>
                )}

                <div className={`ai-message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
                  <p className="ai-message-text">{msg.text}</p>

                  {msg.audio && !isUser && (
                    <div className="ai-audio-playback-bar">
                      <button
                        type="button"
                        className={`ai-audio-play-btn ${isPlaying ? "playing" : ""}`}
                        onClick={() => playAudio(msg.audio, idx)}
                        aria-label={isPlaying ? "Stop audio" : "Play speech"}
                      >
                        {isPlaying ? <VolumeXIcon size={16} /> : <VolumeIcon size={16} />}
                        <span>{isPlaying ? "Stop Audio" : "Play Voice (AI TTS)"}</span>
                      </button>
                      {isPlaying && <span className="audio-wave-anim">🔊 Playing...</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="ai-message-row assistant-row">
              <div className="ai-bubble-avatar">
                <BotIcon size={16} />
              </div>
              <div className="ai-message-bubble assistant-bubble ai-typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Starter Prompts */}
        {messages.length <= 2 && (
          <div className="ai-starter-prompts">
            <span className="starter-label">
              <SparklesIcon size={14} />
              {appLanguage === "hi" ? "सुझाए गए प्रश्न:" : appLanguage === "mr" ? "सुचवलेले प्रश्न:" : "Suggested Questions:"}
            </span>
            <div className="starter-chips-row">
              {starterPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="starter-chip-btn"
                  onClick={() => sendMessage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="ai-input-area">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="ai-input-form"
          >
            <button
              type="button"
              className={`ai-mic-btn ${listening ? "recording" : ""}`}
              onClick={toggleVoiceInput}
              title={listening ? "Listening... Click to stop" : "Voice input"}
              aria-label="Toggle voice input"
            >
              <MicIcon size={18} />
              {listening && <span className="mic-pulse-ring" />}
            </button>

            <input
              type="text"
              className="ai-text-input"
              placeholder={
                listening
                  ? (appLanguage === "hi" ? "सुन रहा हूँ..." : appLanguage === "mr" ? "ऐकत आहे..." : "Listening...")
                  : (appLanguage === "hi" ? "एग्रीनेक्सा से कुछ भी पूछें..." : appLanguage === "mr" ? "अ‍ॅग्रीनेक्साला काहीही विचारा..." : "Ask Agrinexa anything about your farm...")
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="ai-send-btn"
              disabled={!input.trim() || loading}
              aria-label="Send question"
            >
              <SendIcon size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}