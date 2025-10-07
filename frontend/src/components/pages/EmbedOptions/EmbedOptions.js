"use client"

import { useState } from "react"
import { ChevronRight, Github, Twitter, Linkedin, Mail, Copy, Upload, RefreshCw } from "lucide-react"
import { useUser } from "../../../contexts/UserContext"

const EmbedOptions = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("embed-options")
  const [customization, setCustomization] = useState({
    theme: "dark",
    width: "380",
    height: "600",
    position: "bottom-right",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    avatar: null,
  })
  const [showCopied, setShowCopied] = useState(false)

  const positions = [
    { value: "bottom-right", label: "Bottom Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "top-right", label: "Top Right" },
    { value: "top-left", label: "Top Left" },
  ]

  const themes = [
    { value: "light", label: "Light Theme" },
    { value: "dark", label: "Dark Theme" },
    { value: "custom", label: "Custom Theme" },
  ]

  const handleCustomizationChange = (field, value) => {
    setCustomization((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleCustomizationChange("avatar", reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateEmbedCode = () => {
    return `<script>
  window.embedConfig = {
    theme: "${customization.theme}",
    width: "${customization.width}px",
    height: "${customization.height}px",
    position: "${customization.position}",
    primaryColor: "${customization.primaryColor}",
    secondaryColor: "${customization.secondaryColor}"
  };
</script>
<script src="https://embed.example.com/widget.js"></script>`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode())
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const resetCustomization = () => {
    setCustomization({
      theme: "dark",
      width: "380",
      height: "600",
      position: "bottom-right",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      avatar: null,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🔔</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
              <span className="text-white font-medium">{user?.name || 'User'}</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">EmbedOptions</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Customize and embed your chat interface seamlessly with our beautiful gradient theme.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
            {[
              { id: "embed-options", label: "Embed Options" },
              { id: "features", label: "Features" },
              { id: "pricing", label: "Pricing" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-white text-purple-600 shadow-lg" : "text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Customize Your Chat Widget</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Theme Selection */}
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Theme</label>
                <select
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  value={customization.theme}
                  onChange={(e) => handleCustomizationChange("theme", e.target.value)}
                >
                  {themes.map((theme) => (
                    <option key={theme.value} value={theme.value} className="bg-purple-800 text-white">
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Width */}
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Width (px)</label>
                <input
                  type="number"
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm placeholder-white/70"
                  value={customization.width}
                  onChange={(e) => handleCustomizationChange("width", e.target.value)}
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Height (px)</label>
                <input
                  type="number"
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm placeholder-white/70"
                  value={customization.height}
                  onChange={(e) => handleCustomizationChange("height", e.target.value)}
                />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Position</label>
                <select
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                  value={customization.position}
                  onChange={(e) => handleCustomizationChange("position", e.target.value)}
                >
                  {positions.map((position) => (
                    <option key={position.value} value={position.value} className="bg-purple-800 text-white">
                      {position.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-lg border-2 border-white/30 cursor-pointer"
                    value={customization.primaryColor}
                    onChange={(e) => handleCustomizationChange("primaryColor", e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    value={customization.primaryColor}
                    onChange={(e) => handleCustomizationChange("primaryColor", e.target.value)}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-lg border-2 border-white/30 cursor-pointer"
                    value={customization.secondaryColor}
                    onChange={(e) => handleCustomizationChange("secondaryColor", e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    value={customization.secondaryColor}
                    onChange={(e) => handleCustomizationChange("secondaryColor", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="mb-12">
              <label className="block text-white font-medium text-sm mb-2">Bot Avatar</label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="avatar-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/30 border-dashed rounded-lg cursor-pointer bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-white/70" />
                    <p className="mb-2 text-sm text-white/70">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-white/50">PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            </div>

            {/* Preview Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Preview</h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/30">
                <div
                  className="max-w-md mx-auto rounded-lg p-6 shadow-lg"
                  style={{
                    backgroundColor: customization.theme === "dark" ? "#1f2937" : "#ffffff",
                    color: customization.theme === "dark" ? "#ffffff" : "#1f2937",
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {customization.avatar ? (
                      <img
                        src={customization.avatar || "/placeholder.svg"}
                        alt="Bot Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                    )}
                    <div
                      className="flex-1 rounded-lg p-3 text-white"
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      Hello! How can I help you today?
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Embed Code</h3>
              <div className="relative">
                <textarea
                  readOnly
                  className="w-full h-40 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-white/30 resize-none focus:outline-none"
                  value={generateEmbedCode()}
                />
                <button
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors backdrop-blur-sm"
                  onClick={copyToClipboard}
                >
                  {showCopied ? <span className="text-sm px-2">Copied!</span> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <button
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center space-x-2"
                onClick={resetCustomization}
              >
                <RefreshCw size={16} />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 px-8 py-12 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-white text-xl font-bold mb-4">EmbedOptions</h3>
              <p className="text-white/70 mb-6">
                Create beautiful, customizable chat widgets that seamlessly integrate with your website.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  <Github size={20} />
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  <Mail size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70">© 2024 EmbedOptions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default EmbedOptions
