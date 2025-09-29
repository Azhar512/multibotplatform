"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Upload, Plus, Trash2, Save, RotateCcw, Settings, Bot, MessageSquare, Zap } from "lucide-react"

const PersonalitySettings = () => {
  // Core personality settings
  const [tone, setTone] = useState("friendly")
  const [formalityLevel, setFormalityLevel] = useState(50)
  const [useEmojis, setUseEmojis] = useState(false)
  const [useSlang, setUseSlang] = useState(false)
  const [responseLength, setResponseLength] = useState("medium")
  const [showTypingIndicator, setShowTypingIndicator] = useState(true)

  // Messages
  const [greetingMessage, setGreetingMessage] = useState("Hello! How can I help you today?")
  const [farewellMessage, setFarewellMessage] = useState("Thank you for chatting! Have a great day!")
  const [errorMessage, setErrorMessage] = useState("I apologize, but I'm having trouble understanding that.")

  // Integration settings
  const [integrationConfig, setIntegrationConfig] = useState({
    apiKey: "",
    webhookUrl: "",
    crmSystem: "none",
    enableVoice: false,
    enableChat: true,
    enableEmail: false,
  })

  // Real-time preview
  const [previewQuery, setPreviewQuery] = useState("How can I help you?")
  const [previewResponse, setPreviewResponse] = useState("")

  // Training data
  const [trainingData, setTrainingData] = useState({
    uploadedFiles: [],
    customFAQs: [],
    lastTrainingDate: null,
  })

  // Behavioral sliders
  const [behaviorSliders, setBehaviorSliders] = useState({
    empathy: 50,
    assertiveness: 50,
    Humor: 50,
    patience: 50,
    confidence: 50,
  })

  // Features configuration
  const [features, setFeatures] = useState({
    callHandling: false,
    appointmentBooking: false,
    customerNotifications: false,
    returnsHandling: false,
  })

  // Generate real-time preview based on current settings
  useEffect(() => {
    const generatePreview = () => {
      let response = ""
      const empathyLevel = behaviorSliders.empathy
      const profLevel = behaviorSliders.assertiveness

      if (empathyLevel > 75) {
        response =
          "Dear [Customer's Name],\n\nI truly understand how frustrating this experience must have been for you. "
      } else if (empathyLevel > 50) {
        response = "Dear [Customer's Name],\n\nThank you for sharing your concerns with us. "
      } else {
        response = "Dear [Customer's Name],\n\nI appreciate you letting us know about this issue. "
      }

      if (profLevel > 75) {
        response +=
          "We take such matters seriously and have already initiated a review of what happened. Rest assured, corrective actions are being taken. "
      } else if (profLevel > 50) {
        response += "We'll look into this matter promptly and address any underlying issues."
      } else {
        response +=
          "We will investigate this matter and ensure that steps are taken to avoid such incidents in the future."
      }

      if (useEmojis) response += " 😊"

      setPreviewResponse(response)
    }

    generatePreview()
  }, [behaviorSliders, useEmojis, tone, formalityLevel])

  // Handle file upload for training
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setTrainingData((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files],
      lastTrainingDate: new Date().toISOString(),
    }))
  }

  // Handle FAQ addition
  const handleAddFAQ = (question, answer) => {
    setTrainingData((prev) => ({
      ...prev,
      customFAQs: [...prev.customFAQs, { question, answer }],
    }))
  }

  // Remove FAQ
  const handleRemoveFAQ = (index) => {
    setTrainingData((prev) => ({
      ...prev,
      customFAQs: prev.customFAQs.filter((_, i) => i !== index),
    }))
  }

  // Remove uploaded file
  const handleRemoveFile = (index) => {
    setTrainingData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }))
  }

  // Save all settings
  const handleSave = async () => {
    const settings = {
      personality: {
        tone,
        formalityLevel,
        useEmojis,
        useSlang,
        responseLength,
        showTypingIndicator,
        behaviorSliders,
      },
      messages: {
        greeting: greetingMessage,
        farewell: farewellMessage,
        error: errorMessage,
      },
      integration: integrationConfig,
      features,
      trainingData,
    }

    console.log("Saving settings:", settings)
    // API call would go here
  }

  // Reset to defaults
  const handleReset = () => {
    setTone("friendly")
    setFormalityLevel(50)
    setUseEmojis(false)
    setUseSlang(false)
    setBehaviorSliders({
      empathy: 50,
      assertiveness: 50,
      Humor: 50,
      patience: 50,
      confidence: 50,
    })
    setFeatures({
      callHandling: false,
      appointmentBooking: false,
      customerNotifications: false,
      returnsHandling: false,
    })
    setGreetingMessage("Hello! How can I help you today?")
    setFarewellMessage("Thank you for chatting! Have a great day!")
    setErrorMessage("I apologize, but I'm having trouble understanding that.")
    setIntegrationConfig({
      apiKey: "",
      webhookUrl: "",
      crmSystem: "none",
      enableVoice: false,
      enableChat: true,
      enableEmail: false,
    })
    setTrainingData({
      uploadedFiles: [],
      customFAQs: [],
      lastTrainingDate: null,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bot className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">AI Personality Configuration</h1>
              <p className="text-white/70">Configure your AI assistant's personality and behavior</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
            <span className="text-white font-medium">Azhar</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Behavior Configuration Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Behavior Configuration</h2>
            </div>

            <div className="space-y-6">
              {Object.entries(behaviorSliders).map(([trait, value]) => (
                <div key={trait} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-medium text-sm">
                      {trait.charAt(0).toUpperCase() + trait.slice(1)}
                    </label>
                    <span className="text-white/70 text-sm font-medium">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) =>
                      setBehaviorSliders((prev) => ({
                        ...prev,
                        [trait]: Number.parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${value}%, rgba(255,255,255,0.2) ${value}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Basic Settings */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-white font-medium text-sm">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  >
                    <option value="friendly" className="bg-purple-800 text-white">
                      Friendly
                    </option>
                    <option value="professional" className="bg-purple-800 text-white">
                      Professional
                    </option>
                    <option value="casual" className="bg-purple-800 text-white">
                      Casual
                    </option>
                    <option value="formal" className="bg-purple-800 text-white">
                      Formal
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-white font-medium text-sm">Response Length</label>
                  <select
                    value={responseLength}
                    onChange={(e) => setResponseLength(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  >
                    <option value="short" className="bg-purple-800 text-white">
                      Short
                    </option>
                    <option value="medium" className="bg-purple-800 text-white">
                      Medium
                    </option>
                    <option value="long" className="bg-purple-800 text-white">
                      Long
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={useEmojis}
                    onChange={(e) => setUseEmojis(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                  />
                  <span>Use Emojis</span>
                </label>
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={useSlang}
                    onChange={(e) => setUseSlang(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                  />
                  <span>Use Slang</span>
                </label>
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={showTypingIndicator}
                    onChange={(e) => setShowTypingIndicator(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                  />
                  <span>Show Typing Indicator</span>
                </label>
              </div>
            </div>
          </div>

          {/* Real-time Preview Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <MessageSquare className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Real-time Preview</h2>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={previewQuery}
                onChange={(e) => setPreviewQuery(e.target.value)}
                placeholder="Type a sample query..."
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />

              <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                <p className="text-white/70 text-sm mb-2">Bot would respond:</p>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                  {previewResponse || "Configure your settings to see a preview response..."}
                </div>
              </div>
            </div>

            {/* Custom Messages */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Custom Messages</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-white font-medium text-sm mb-2">Greeting Message</label>
                  <textarea
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium text-sm mb-2">Farewell Message</label>
                  <textarea
                    value={farewellMessage}
                    onChange={(e) => setFarewellMessage(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium text-sm mb-2">Error Message</label>
                  <textarea
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Integration Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">API Key</label>
              <input
                type="password"
                value={integrationConfig.apiKey}
                onChange={(e) =>
                  setIntegrationConfig((prev) => ({
                    ...prev,
                    apiKey: e.target.value,
                  }))
                }
                placeholder="Enter API Key"
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">Webhook URL</label>
              <input
                type="url"
                value={integrationConfig.webhookUrl}
                onChange={(e) =>
                  setIntegrationConfig((prev) => ({
                    ...prev,
                    webhookUrl: e.target.value,
                  }))
                }
                placeholder="Enter Webhook URL"
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">CRM System</label>
              <select
                value={integrationConfig.crmSystem}
                onChange={(e) =>
                  setIntegrationConfig((prev) => ({
                    ...prev,
                    crmSystem: e.target.value,
                  }))
                }
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="none" className="bg-purple-800 text-white">
                  None
                </option>
                <option value="salesforce" className="bg-purple-800 text-white">
                  Salesforce
                </option>
                <option value="hubspot" className="bg-purple-800 text-white">
                  HubSpot
                </option>
                <option value="zendesk" className="bg-purple-800 text-white">
                  Zendesk
                </option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Communication Channels</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={integrationConfig.enableVoice}
                  onChange={(e) =>
                    setIntegrationConfig((prev) => ({
                      ...prev,
                      enableVoice: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                />
                <span>Enable Voice</span>
              </label>
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={integrationConfig.enableChat}
                  onChange={(e) =>
                    setIntegrationConfig((prev) => ({
                      ...prev,
                      enableChat: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                />
                <span>Enable Chat</span>
              </label>
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={integrationConfig.enableEmail}
                  onChange={(e) =>
                    setIntegrationConfig((prev) => ({
                      ...prev,
                      enableEmail: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                />
                <span>Enable Email</span>
              </label>
            </div>
          </div>
        </div>

        {/* Features Configuration Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-6">Features Configuration</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(features).map(([feature, enabled]) => (
              <label
                key={feature}
                className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) =>
                    setFeatures((prev) => ({
                      ...prev,
                      [feature]: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500"
                />
                <span className="text-white text-sm font-medium">{feature.split(/(?=[A-Z])/).join(" ")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Training Data Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-6">Training Data</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File Upload */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Upload Training Files</h3>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 transition-colors">
                <Upload className="w-12 h-12 text-white/70 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-white font-medium">Click to upload files</span>
                  <p className="text-white/70 text-sm mt-1">Supports .txt, .csv, .json files</p>
                  <input type="file" multiple onChange={handleFileUpload} accept=".txt,.csv,.json" className="hidden" />
                </label>
              </div>

              {trainingData.uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-white font-medium">Uploaded Files:</h4>
                  {trainingData.uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/10 rounded-lg p-3 border border-white/20"
                    >
                      <span className="text-white text-sm">{file.name}</span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom FAQs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Custom FAQs</h3>
                <button
                  onClick={() => handleAddFAQ("New Question", "New Answer")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {trainingData.customFAQs.map((faq, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-medium text-sm">Q: {faq.question}</p>
                      <button
                        onClick={() => handleRemoveFAQ(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-white/80 text-sm">A: {faq.answer}</p>
                  </div>
                ))}
              </div>

              {trainingData.customFAQs.length === 0 && (
                <div className="text-center py-8 text-white/70">
                  <p>No custom FAQs added yet.</p>
                  <p className="text-sm">Click "Add FAQ" to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center space-x-2"
          >
            <Save size={20} />
            <span>Save Configuration</span>
          </button>
          <button
            onClick={handleReset}
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center space-x-2"
          >
            <RotateCcw size={20} />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PersonalitySettings
