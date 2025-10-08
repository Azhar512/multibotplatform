"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronRight, MessageSquare, Phone, Settings, Mic, MicOff, Send, Bot, Users, Zap } from "lucide-react"
import { botAPI } from "../../../services/api.js"
import ChatWindow from "./ChatWindow"
import CallInterface from "./CallInterface.js"
import CrmPanel from "./CrmPanel"
import { twilioAPI } from "../../../services/api.js"
import { Device } from "@twilio/voice-sdk"
import { useUser } from "../../../contexts/UserContext"
import io from "socket.io-client"

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
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
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
  const { user } = useUser()
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
  const socketRef = useRef(null)

  const isDeepSeekModel = selectedModel === "deepseek-r1"
  const isOpenAIModel = selectedModel === "gpt-4-turbo"

  // Initialize Audio Context, Socket.io, and Check Auth
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
      initializeSocket()
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      // Clean up Twilio device on unmount
      if (twilioDeviceRef.current) {
        twilioDeviceRef.current.destroy()
      }
      // Clean up Socket.io connection
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Initialize Socket.io connection
  const initializeSocket = () => {
    const token = getAuthToken()
    if (!token) return

    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setApiStatus(prev => ({
        ...prev,
        isConnected: true,
        lastChecked: new Date()
      }))
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setApiStatus(prev => ({
        ...prev,
        isConnected: false,
        lastChecked: new Date()
      }))
    })

    socket.on('bot_response', (data) => {
      console.log('Real-time bot response:', data)
      // Handle real-time bot responses if needed
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
      setError(error.message)
    })

    socket.on('interaction_update', (data) => {
      console.log('Interaction update:', data)
      // Handle real-time interaction updates
    })

    return socket
  }

  // Initialize Twilio Device
  const initializeTwilioDevice = async () => {
    if (twilioDeviceRef.current) return

    try {
      console.log("Getting Twilio token...")
      const result = await twilioAPI.getToken()

      if (!result.success) {
        console.error("Token fetch failed:", result.error)
        throw new Error(`Failed to get Twilio token: ${result.error}`)
      }

      const twilioToken = result.data?.token
      if (typeof twilioToken !== "string" || !twilioToken) {
        console.error("Invalid token format:", twilioToken)
        throw new Error(`Invalid token format: ${typeof twilioToken}`)
      }

      console.log("Token value preview:", twilioToken.substring(0, 10) + "...")

      twilioDeviceRef.current = new Device(twilioToken, {
        debug: true,
        logLevel: "debug",
        codecPreferences: ["opus", "pcmu"],
        enableRingingState: true,
      })

      // Set up event handlers
      twilioDeviceRef.current.on("error", (error) => {
        console.error("Twilio device error:", error)
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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://168.231.114.68:5000'}/api/health`, {
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
    setError(null)

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

      console.log("API response:", result)

      if (!result.success) {
        throw new Error(result.error || "Failed to get response")
      }

      let botResponse, confidence, sentiment

      if (result.data) {
        botResponse = result.data.botResponse || result.data.text || "No response text"
        confidence = result.data.confidence || 0.5
        sentiment = result.data.sentiment || null
      } else if (typeof result === "object") {
        botResponse = result.botResponse || result.text || "No response text"
        confidence = result.confidence || 0.5
        sentiment = result.sentiment || null
      } else {
        botResponse = "Received response in unexpected format"
        confidence = 0.3
        sentiment = null
      }

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
        confidence,
        sentiment,
      }

      setMessages((prev) => [...prev, botMessage])
      setError(null)

      // Emit real-time event for analytics
      if (socketRef.current) {
        socketRef.current.emit('bot_message', {
          message: text,
          response: botResponse,
          model: selectedModel,
          timestamp: new Date().toISOString()
        })
      }

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
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bot className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Bot Interaction</h1>
              <p className="text-white/70">AI-powered chat and call interface</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!apiStatus.isConnected && (
              <div className="bg-red-500/20 text-red-100 px-3 py-1 rounded-full text-sm border border-red-400/30">
                API Disconnected
              </div>
            )}
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
            <span className="text-white font-medium">{user?.name || 'User'}</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* API Connection Alert */}
        {!apiStatus.isConnected && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30 p-4 mb-6">
            <p className="text-red-100">
              API connection is unavailable. Please check your connection and login status.
            </p>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
            <button
              onClick={() => handleModeChange("chat")}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeMode === "chat" ? "bg-white text-purple-600 shadow-lg" : "text-white hover:bg-white/10"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Mode</span>
            </button>
            <button
              onClick={() => handleModeChange("call")}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeMode === "call" ? "bg-white text-purple-600 shadow-lg" : "text-white hover:bg-white/10"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Call Mode</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Model Selection - only visible in chat mode */}
            {activeMode === "chat" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-bold text-white">Model Selection</h2>
                </div>
                <select
                  value={selectedModel}
                  onChange={handleModelChange}
                  disabled={!apiStatus.isConnected}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.value} value={model.value} className="bg-purple-800 text-white">
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Voice Selection - only for OpenAI models in chat mode */}
            {isOpenAIModel && activeMode === "chat" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Voice Selection</h2>
                <select
                  value={selectedVoice}
                  onChange={handleVoiceChange}
                  disabled={!apiStatus.isConnected}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  {VOICE_OPTIONS.map((voice) => (
                    <option key={voice.value} value={voice.value} className="bg-purple-800 text-white">
                      {voice.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Industry Selection - not for DeepSeek */}
            {!isDeepSeekModel && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Industry Preset</h2>
                <select
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                  disabled={!apiStatus.isConnected}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                >
                  {Object.keys(INDUSTRY_PRESETS).map((industry) => (
                    <option key={industry} value={industry} className="bg-purple-800 text-white">
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Personality Settings */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Personality Settings</h2>
              <div className="space-y-4">
                {Object.entries(personalitySettings).map(([trait, value]) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-white font-medium text-sm">{trait}</label>
                      <span className="text-white/70 text-sm font-medium">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handlePersonalityChange(trait, e.target.value)}
                      disabled={!apiStatus.isConnected}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${value}%, rgba(255,255,255,0.2) ${value}%, rgba(255,255,255,0.2) 100%)`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CRM Configuration - only in call mode */}
            {activeMode === "call" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-bold text-white">CRM Integration</h2>
                </div>
                <select
                  value={crmConfig.system}
                  onChange={handleCrmSystemChange}
                  disabled={!apiStatus.isConnected}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm mb-4"
                >
                  {CRM_SYSTEMS.map((system) => (
                    <option key={system.value} value={system.value} className="bg-purple-800 text-white">
                      {system.label}
                    </option>
                  ))}
                </select>

                {crmConfig.system !== "none" && (
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 text-white">
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
                        className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">Auto-log calls to CRM</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
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
                        className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">Display customer data</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Bot Configuration */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">Bot Configuration</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-white">
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
                    className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">Enable Voice Input</span>
                </label>
                <label className="flex items-center space-x-2 text-white">
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
                    className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">Enable Text-to-Speech</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Interface */}
          <div className="lg:col-span-2">
            {activeMode === "chat" ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <ChatWindow messages={messages} isLoading={isLoading} error={error} />

                <div className="flex items-center space-x-4 mt-6">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading || !apiStatus.isConnected}
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleMessageSubmit(currentMessage)
                      }
                    }}
                  />

                  <button
                    onClick={() => handleMessageSubmit(currentMessage)}
                    disabled={!currentMessage.trim() || isLoading || !apiStatus.isConnected}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isLoading ? "Sending..." : "Send"}</span>
                  </button>

                  {botConfig.enableVoice && (
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading || !apiStatus.isConnected}
                      className={`p-3 rounded-lg font-medium transition-all shadow-lg ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <CallInterface
                    callStatus={callStatus}
                    callData={callData}
                    onInitiateCall={initiateCall}
                    onAnswerCall={answerCall}
                    onEndCall={endCall}
                    personalitySettings={personalitySettings}
                    disabled={!apiStatus.isConnected}
                  />
                </div>

                {crmConfig.enabled && crmConfig.system !== "none" && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
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
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30 p-4 mt-6">
            <p className="text-red-100">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BotInteraction
