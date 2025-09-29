"use client"

import { useState, useEffect } from "react"
import { Phone, PhoneCall, PhoneOff, Mic, Hash, Clock } from "lucide-react"

const CallInterface = ({
  callStatus,
  callData,
  onInitiateCall,
  onAnswerCall,
  onEndCall,
  personalitySettings,
  disabled,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [dialpadVisible, setDialpadVisible] = useState(false)

  const handlePhoneNumberChange = (e) => {
    // Only allow digits, +, and ()
    const value = e.target.value.replace(/[^\d+()]/g, "")
    setPhoneNumber(value)
  }

  const handleKeyPadClick = (digit) => {
    setPhoneNumber((prev) => prev + digit)

    // If in an active call, send DTMF tone
    if (callStatus === "in-progress") {
      // Implementation for sending DTMF tone would go here
      console.log(`Sending DTMF tone: ${digit}`)
    }
  }

  const renderDialpad = () => {
    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"]

    return (
      <div className="mt-6">
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {digits.map((digit) => (
            <button
              key={digit}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold py-4 px-4 rounded-lg transition-colors backdrop-blur-sm border border-white/30 text-lg"
              onClick={() => handleKeyPadClick(digit)}
              disabled={disabled}
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderCallControls = () => {
    switch (callStatus) {
      case "idle":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter phone number..."
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm text-center text-lg"
                disabled={disabled}
              />
              <button
                className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-2"
                onClick={() => setDialpadVisible(!dialpadVisible)}
                disabled={disabled}
              >
                <Hash className="w-4 h-4" />
                <span>{dialpadVisible ? "Hide Dialpad" : "Show Dialpad"}</span>
              </button>
            </div>

            {dialpadVisible && renderDialpad()}

            <button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center space-x-2 text-lg"
              onClick={() => onInitiateCall(phoneNumber)}
              disabled={!phoneNumber || disabled}
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </button>
          </div>
        )

      case "connecting":
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-white text-lg">Connecting to {callData?.to || "number"}...</p>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
            <button
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center space-x-2"
              onClick={onEndCall}
              disabled={disabled}
            >
              <PhoneOff className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        )

      case "ringing":
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-white text-lg">Incoming call from {callData?.from || "unknown"}</p>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Phone className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center space-x-2"
                onClick={onAnswerCall}
                disabled={disabled}
              >
                <PhoneCall className="w-5 h-5" />
                <span>Answer</span>
              </button>
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center space-x-2"
                onClick={onEndCall}
                disabled={disabled}
              >
                <PhoneOff className="w-5 h-5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )

      case "in-progress":
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-white text-lg font-medium">
                On call with: {callData?.to || callData?.from || "unknown"}
              </p>
              <div className="flex items-center justify-center space-x-2 text-white/70">
                <Clock className="w-4 h-4" />
                <CallTimer startTime={callData?.startTime || new Date()} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center justify-center"
                onClick={() => console.log("Toggle mute")}
                disabled={disabled}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center justify-center"
                onClick={() => setDialpadVisible(!dialpadVisible)}
                disabled={disabled}
              >
                <Hash className="w-5 h-5" />
              </button>
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center"
                onClick={onEndCall}
                disabled={disabled}
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

            {dialpadVisible && renderDialpad()}

            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Current Personality Settings:</h3>
              <div className="space-y-3">
                {Object.entries(personalitySettings).map(([trait, value]) => (
                  <div key={trait} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">{trait}</span>
                      <span className="text-white/70 text-sm">{value}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${value}%`,
                          backgroundColor: getTraitColor(trait, value),
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "ended":
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-white text-lg font-medium">Call ended</p>
              {callData && (
                <div className="bg-white/10 rounded-lg p-4 border border-white/20 space-y-2">
                  <p className="text-white/80">
                    {callData.direction === "outgoing" ? `Called: ${callData.to}` : `From: ${callData.from}`}
                  </p>
                  <p className="text-white/80">Duration: {callData.duration || "N/A"}</p>
                </div>
              )}
            </div>
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center space-x-2"
              onClick={() => {
                setPhoneNumber("")
                window.location.reload() // A simple way to reset the call interface
              }}
              disabled={disabled}
            >
              <Phone className="w-5 h-5" />
              <span>New Call</span>
            </button>
          </div>
        )

      default:
        return (
          <div className="text-center">
            <p className="text-white">Call system error. Please refresh the page.</p>
          </div>
        )
    }
  }

  const getTraitColor = (trait, value) => {
    // Define color schemes for different traits
    const colors = {
      Empathy: `hsl(${120 * (value / 100)}, 70%, 50%)`, // Green spectrum
      Assertiveness: `hsl(${220 - 120 * (value / 100)}, 70%, 50%)`, // Blue to red
      Humour: `hsl(${60 * (value / 100)}, 70%, 60%)`, // Yellow spectrum
      Patience: `hsl(180, ${value}%, 50%)`, // Teal spectrum
      Confidence: `hsl(300, ${value}%, 50%)`, // Purple spectrum
    }

    return colors[trait] || `hsl(200, ${value}%, 50%)` // Default blue spectrum
  }

  const getStatusColor = () => {
    switch (callStatus) {
      case "idle":
        return "bg-gray-400"
      case "connecting":
        return "bg-yellow-400 animate-pulse"
      case "ringing":
        return "bg-blue-400 animate-pulse"
      case "in-progress":
        return "bg-green-400"
      case "ended":
        return "bg-red-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = () => {
    switch (callStatus) {
      case "idle":
        return "Ready"
      case "connecting":
        return "Connecting..."
      case "ringing":
        return "Incoming Call"
      case "in-progress":
        return "In Call"
      case "ended":
        return "Call Ended"
      default:
        return "Status Unknown"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">AI Call Assistant</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-white/80 text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {renderCallControls()}
    </div>
  )
}

// Call Timer Component
const CallTimer = ({ startTime }) => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((new Date() - new Date(startTime)) / 1000)
      setTime(elapsedSeconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return [h > 0 ? String(h).padStart(2, "0") : null, String(m).padStart(2, "0"), String(s).padStart(2, "0")]
      .filter(Boolean)
      .join(":")
  }

  return <span className="font-mono">{formatTime(time)}</span>
}

export default CallInterface
