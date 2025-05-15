"use client"

import { useState, useEffect, useRef } from "react"
import { botAPI } from "../../../services/api.js"
import ChatWindow from "./ChatWindow"
import VoiceControls from "./VoiceControls"
import CallInterface from "./CallInterface.js"
import CrmPanel from "./CrmPanel"
import { twilioAPI } from "../../../services/api.js"
import { Device } from "@twilio/voice-sdk"
import "./BotInteraction.css"

const INDUSTRY_PRESETS = {
  general: {
    Empathy: 70,
    Assertiveness: 60,
    Humour: 50,
    Patience: 80,
    Confidence: 60,
  },
  finance: {
    Empathy: 60,
    Assertiveness: 80,
    Humour: 30,
    Patience: 70,
    Confidence: 90,
  },
  legal: {
    Empathy: 50,
    Assertiveness: 90,
    Humour: 10,
    Patience: 70,
    Confidence: 95,
  },
  realEstate: {
    Empathy: 80,
    Assertiveness: 70,
    Humour: 60,
    Patience: 75,
    Confidence: 80,
  },
  insurance: {
    Empathy: 75,
    Assertiveness: 75,
    Humour: 40,
    Patience: 80,
    Confidence: 85,
  },
}

const AVAILABLE_MODELS = [
  { value: "deepseek-r1", label: "DeepSeek R1" },
  { value: "bert-base-uncased", label: "BERT Base Uncased" },
  { value: "bert-large-uncased", label: "BERT Large Uncased" },
  { value: "bert-base-cased", label: "BERT Base Cased" },
  { value: "bert-large-cased", label: "BERT Large Cased" },
  { value: "distilbert-base-uncased", label: "DistilBERT Base Uncased" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" }, // Added OpenAI model
]

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy (Neutral)" },
  { value: "echo", label: "Echo (Male)" },
  { value: "nova", label: "Nova (Female)" },
  { value: "shimmer", label: "Shimmer (Professional)" },
]

const CRM_SYSTEMS = [
  { value: "hubspot", label: "HubSpot" },
  { value: "salesforce", label: "Salesforce" },
  { value: "zoho", label: "Zoho CRM" },
  { value: "none", label: "No CRM Integration" },
]

const getAuthToken = () => {
  const token = localStorage.getItem("token")
  console.log("Current token:", token ? "exists" : "missing")
  return token
}

const BotInteraction = () => {
  // State Management
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState({ isConnected: false, lastChecked: null })

  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].value)
  const [selectedIndustry, setSelectedIndustry] = useState("general")
  const [personalitySettings, setPersonalitySettings] = useState(INDUSTRY_PRESETS.general)

  const [isRecording, setIsRecording] = useState(false)
  const [botConfig, setBotConfig] = useState({
    responseDelay: 1000,
    enableVoice: false,
    enableTextToSpeech: false,
    enableSentiment: false,
    language: "en-US",
  })

  // New states for VoIP functionality
  const [activeMode, setActiveMode] = useState("chat") // 'chat' or 'call'
  const [callStatus, setCallStatus] = useState("idle") // 'idle', 'connecting', 'in-progress', 'ended'
  const [callData, setCallData] = useState(null)
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].value)

  // New states for CRM integration
  const [crmConfig, setCrmConfig] = useState({
    system: "none",
    enabled: false,
    autoLog: true,
    displayCustomerData: true,
  })
  const [customerData, setCustomerData] = useState(null)
  const [callSummary, setCallSummary] = useState(null)

  // Refs
  const audioContextRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const twilioDeviceRef = useRef(null)
  const currentCallRef = useRef(null)

  const isDeepSeekModel = selectedModel === "deepseek-r1"
  const isOpenAIModel = selectedModel === "gpt-4-turbo"

  // Initialize Audio Context and Check Auth
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    const token = getAuthToken()
    if (!token) {
      setError("Please log in to use the chat interface.")
      setApiStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: "Authentication required",
      })
    } else {
      checkApiConnection()
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }

      // Clean up Twilio device on unmount
      if (twilioDeviceRef.current) {
        twilioDeviceRef.current.destroy()
      }
    }
  }, [])

  // Initialize Twilio Device
  const initializeTwilioDevice = async () => {
    if (twilioDeviceRef.current) return

    try {
      console.log("Getting Twilio token...")

      const response = await twilioAPI.getToken()
      console.log("Token response:", response)

      if (!response.success) {
        throw new Error(response.error || "Failed to get Twilio token")
      }

      // Extract the token, ensuring it's a string
      const twilioToken = response.data?.token

      if (typeof twilioToken !== "string" || !twilioToken) {
        console.error("Invalid token format:", twilioToken)
        throw new Error(`Invalid token format: ${typeof twilioToken}`)
      }

      console.log("Token value preview:", twilioToken.substring(0, 10) + "...")

      // Create a new Device instance with the token directly
      twilioDeviceRef.current = new Device(twilioToken, {
        debug: true,
        logLevel: "debug", // Add this line
        codecPreferences: ["opus", "pcmu"],
        enableRingingState: true,
      })

      // Set up event handlers
      twilioDeviceRef.current.on("error", (error) => {
        console.error("Twilio device error:", error)
        console.error("Error code:", error.code)
        console.error("Error message:", error.message)
        console.error("Error context:", error.twilioError)
        setError(`Call system error: ${error.message || "Unknown error"} (Code: ${error.code})`)
      })

      twilioDeviceRef.current.on("incoming", (conn) => {
        setCallStatus("ringing")
        setCallData({
          from: conn.parameters.From,
          to: conn.parameters.To,
          callSid: conn.parameters.CallSid,
          direction: "incoming",
        })

        if (crmConfig.enabled && crmConfig.displayCustomerData) {
          fetchCustomerData(conn.parameters.From)
        }

        currentCallRef.current = conn
      })

      console.log("Twilio device initialized successfully")
    } catch (error) {
      console.error("Failed to initialize Twilio:", error)
      setError(`Failed to initialize call system: ${error.message}`)
    }
  }
  const checkApiConnection = async () => {
    try {
      const response = await fetch("/api/health-check", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })
      if (!response.ok) throw new Error("API health check failed")

      setApiStatus({
        isConnected: true,
        lastChecked: new Date(),
      })
    } catch (error) {
      setApiStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: error.message,
      })
      setError("Unable to connect to API. Please check your connection and login status.")
    }
  }

  // Event Handlers
  const handleIndustryChange = (e) => {
    const industry = e.target.value
    setSelectedIndustry(industry)
    setPersonalitySettings(INDUSTRY_PRESETS[industry])
  }

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value)
  }

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value)
  }

  const handlePersonalityChange = (trait, value) => {
    setPersonalitySettings((prev) => ({
      ...prev,
      [trait]: Number.parseInt(value),
    }))
  }

  const handleCrmSystemChange = (e) => {
    setCrmConfig((prev) => ({
      ...prev,
      system: e.target.value,
      enabled: e.target.value !== "none",
    }))
  }

  const handleModeChange = (mode) => {
    setActiveMode(mode)
    if (mode === "call" && !twilioDeviceRef.current) {
      initializeTwilioDevice()
    }
  }

  // Call Control Handlers
  const initiateCall = async (phoneNumber) => {
    if (!twilioDeviceRef.current) {
      await initializeTwilioDevice()
    }

    try {
      setCallStatus("connecting")

      // Send personality and voice settings to backend
      const params = {
        To: phoneNumber,
        personalitySettings: JSON.stringify(personalitySettings),
        voiceType: selectedVoice,
        modelType: selectedModel,
      }

      const call = await twilioDeviceRef.current.connect({ params })

      currentCallRef.current = call

      setCallData({
        from: "Your System",
        to: phoneNumber,
        callSid: call.parameters.CallSid,
        direction: "outgoing",
      })

      call.on("accept", () => {
        setCallStatus("in-progress")
      })

      call.on("disconnect", () => {
        setCallStatus("ended")
        if (crmConfig.enabled && crmConfig.autoLog) {
          generateCallSummary()
        }
      })

      // If CRM is enabled, fetch customer data
      if (crmConfig.enabled && crmConfig.displayCustomerData) {
        fetchCustomerData(phoneNumber)
      }
    } catch (error) {
      console.error("Call initiation error:", error)
      setError("Failed to initiate call. Please try again.")
      setCallStatus("idle")
    }
  }

  const answerCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.accept()
      setCallStatus("in-progress")
    }
  }

  const endCall = () => {
    if (currentCallRef.current) {
      currentCallRef.current.disconnect()
      setCallStatus("ended")

      if (crmConfig.enabled && crmConfig.autoLog) {
        generateCallSummary()
      }
    }
  }

  // CRM Functions
  const fetchCustomerData = async (phoneNumber) => {
    if (!crmConfig.enabled || crmConfig.system === "none") return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/crm/${crmConfig.system}/customer?phone=${phoneNumber}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch customer data")

      const data = await response.json()
      setCustomerData(data)
    } catch (error) {
      console.error("CRM data fetch error:", error)
      setError("Could not retrieve customer information.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateCallSummary = async () => {
    if (!callData || !currentCallRef.current) return

    try {
      const response = await fetch("/api/calls/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          callSid: callData.callSid,
          crmSystem: crmConfig.system,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate call summary")

      const summary = await response.json()
      setCallSummary(summary)

      // Log to CRM if enabled
      if (crmConfig.enabled && crmConfig.autoLog) {
        logCallToCrm(summary)
      }
    } catch (error) {
      console.error("Call summary error:", error)
      setError("Could not generate call summary.")
    }
  }

  const logCallToCrm = async (summary) => {
    if (!crmConfig.enabled || crmConfig.system === "none") return

    try {
      await fetch(`/api/crm/${crmConfig.system}/log-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          callData,
          summary,
          personalitySettings,
        }),
      })

      console.log("Call logged to CRM successfully")
    } catch (error) {
      console.error("CRM logging error:", error)
      setError("Failed to log call to CRM.")
    }
  }

  // Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        await handleVoiceSubmission(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      setError("Microphone access denied. Please check your browser permissions.")
      console.error("Microphone error:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const handleVoiceSubmission = async (audioBlob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      // Add personality settings to the request
      formData.append("personalitySettings", JSON.stringify(personalitySettings))
      formData.append("modelType", selectedModel)

      if (isOpenAIModel) {
        formData.append("voiceType", selectedVoice)
      }

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error("Speech to text conversion failed")

      const { text } = await response.json()
      if (text) {
        handleMessageSubmit(text)
      }
    } catch (error) {
      setError("Voice processing failed. Please try typing your message instead.")
      console.error("Voice processing error:", error)
    }
  }

  const handleMessageSubmit = async (text) => {
    if (!text || !text.trim()) {
      setError("Please enter a message")
      return
    }

    const newMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setCurrentMessage("")
    setIsLoading(true)
    setError(null) // Clear any previous errors

    try {
      let result

      if (selectedModel === "deepseek-r1") {
        result = await botAPI.getDeepseekResponse(text, personalitySettings, botConfig)
      } else if (selectedModel === "gpt-4-turbo") {
        result = await botAPI.getOpenAIResponse(text, personalitySettings, {
          ...botConfig,
          voiceType: selectedVoice,
        })
      } else {
        result = await botAPI.getBertResponse(text, personalitySettings, selectedModel, botConfig)
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to get response")
      }

      const { botResponse, confidence, sentiment } = result.data

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
        confidence,
        sentiment,
      }

      setMessages((prev) => [...prev, botMessage])

      // If text-to-speech is enabled, play the response
      if (botConfig.enableTextToSpeech) {
        playTextToSpeech(botResponse)
      }
    } catch (error) {
      console.error("Bot response error:", error)
      setError(error.message || "Failed to get bot response. Please try again.")

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I apologize, but I couldn't process your message. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const playTextToSpeech = async (text) => {
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
        }),
      })

      if (!response.ok) throw new Error("Text to speech conversion failed")

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      console.error("Text to speech error:", error)
      setError("Could not play audio response.")
    }
  }

  return (
    <div className="bot-interaction-container">
      {!apiStatus.isConnected && (
        <div className="alert alert-error mb-4">
          <p>API connection is unavailable. Please check your connection and login status.</p>
        </div>
      )}

      <div className="mode-tabs">
        <button
          className={`tab-button ${activeMode === "chat" ? "active" : ""}`}
          onClick={() => handleModeChange("chat")}
        >
          Chat Mode
        </button>
        <button
          className={`tab-button ${activeMode === "call" ? "active" : ""}`}
          onClick={() => handleModeChange("call")}
        >
          Call Mode
        </button>
      </div>

      <div className="settings-panel">
        {/* Model selection dropdown - only visible in chat mode */}
        {activeMode === "chat" && (
          <div className="model-selection">
            <h2>Model Selection</h2>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="model-select"
              disabled={!apiStatus.isConnected}
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {isOpenAIModel && activeMode === "chat" && (
          <div className="voice-selection">
            <h2>Voice Selection</h2>
            <select
              value={selectedVoice}
              onChange={handleVoiceChange}
              className="voice-select"
              disabled={!apiStatus.isConnected}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isDeepSeekModel && (
          <div className="industry-selection">
            <h2>Industry Preset</h2>
            <select
              value={selectedIndustry}
              onChange={handleIndustryChange}
              className="industry-select"
              disabled={!apiStatus.isConnected}
            >
              {Object.keys(INDUSTRY_PRESETS).map((industry) => (
                <option key={industry} value={industry}>
                  {industry.charAt(0).toUpperCase() + industry.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="personality-settings">
          <h2>Personality Settings</h2>
          <div className="personality-sliders">
            {Object.entries(personalitySettings).map(([trait, value]) => (
              <div key={trait} className="slider-group">
                <label>{trait}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handlePersonalityChange(trait, e.target.value)}
                  className="personality-slider"
                  disabled={!apiStatus.isConnected}
                />
                <span>{value}%</span>
              </div>
            ))}
          </div>
        </div>

        {activeMode === "call" && (
          <div className="crm-config">
            <h2>CRM Integration</h2>
            <select
              value={crmConfig.system}
              onChange={handleCrmSystemChange}
              className="crm-select"
              disabled={!apiStatus.isConnected}
            >
              {CRM_SYSTEMS.map((system) => (
                <option key={system.value} value={system.value}>
                  {system.label}
                </option>
              ))}
            </select>

            {crmConfig.system !== "none" && (
              <div className="crm-options">
                <label>
                  <input
                    type="checkbox"
                    checked={crmConfig.autoLog}
                    onChange={() =>
                      setCrmConfig((prev) => ({
                        ...prev,
                        autoLog: !prev.autoLog,
                      }))
                    }
                    disabled={!apiStatus.isConnected}
                  />
                  Auto-log calls to CRM
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={crmConfig.displayCustomerData}
                    onChange={() =>
                      setCrmConfig((prev) => ({
                        ...prev,
                        displayCustomerData: !prev.displayCustomerData,
                      }))
                    }
                    disabled={!apiStatus.isConnected}
                  />
                  Display customer data
                </label>
              </div>
            )}
          </div>
        )}

        <div className="bot-config">
          <h2>Bot Configuration</h2>
          <label>
            <input
              type="checkbox"
              checked={botConfig.enableVoice}
              onChange={() =>
                setBotConfig((prev) => ({
                  ...prev,
                  enableVoice: !prev.enableVoice,
                }))
              }
              disabled={!apiStatus.isConnected}
            />
            Enable Voice Input
          </label>
          <label>
            <input
              type="checkbox"
              checked={botConfig.enableTextToSpeech}
              onChange={() =>
                setBotConfig((prev) => ({
                  ...prev,
                  enableTextToSpeech: !prev.enableTextToSpeech,
                }))
              }
              disabled={!apiStatus.isConnected}
            />
            Enable Text-to-Speech
          </label>
        </div>
      </div>

      <div className="main-interface">
        {activeMode === "chat" ? (
          <>
            <ChatWindow messages={messages} isLoading={isLoading} error={error} />

            <div className="input-controls">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
                disabled={isLoading || !apiStatus.isConnected}
              />
              <button
                onClick={() => handleMessageSubmit(currentMessage)}
                className="send-button"
                disabled={!currentMessage.trim() || isLoading || !apiStatus.isConnected}
              >
                {isLoading ? "Sending..." : "Send"}
              </button>

              {botConfig.enableVoice && (
                <VoiceControls
                  isRecording={isRecording}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  disabled={isLoading || !apiStatus.isConnected}
                />
              )}
            </div>
          </>
        ) : (
          <div className="call-interface-container">
            <CallInterface
              callStatus={callStatus}
              callData={callData}
              onInitiateCall={initiateCall}
              onAnswerCall={answerCall}
              onEndCall={endCall}
              personalitySettings={personalitySettings}
              disabled={!apiStatus.isConnected}
            />

            {crmConfig.enabled && crmConfig.system !== "none" && (
              <div className="crm-container">
                <CrmPanel
                  customerData={customerData}
                  callSummary={callSummary}
                  system={crmConfig.system}
                  callInProgress={callStatus === "in-progress"}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default BotInteraction
