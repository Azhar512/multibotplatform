"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, ChevronRight, Shield, Key, Smartphone, Save } from "lucide-react"

const SettingsPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [newPasswordVisible, setNewPasswordVisible] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible)
  }

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  const handlePasswordSave = () => {
    // Handle password save logic here
    console.log("Password save logic")
  }

  const handleTwoFactorSetup = () => {
    // Handle 2FA setup logic here
    console.log("2FA setup logic")
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Security Settings</h1>
              <p className="text-white/70">Manage your account security and authentication</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🔔</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
              <span className="text-white font-medium">Azhar</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Password Section */}
          <section className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <Key className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Password Management</h2>
            </div>

            <div className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label htmlFor="current-password" className="block text-white font-medium text-sm">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-white font-medium text-sm">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={newPasswordVisible ? "text" : "password"}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="Enter a new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    onClick={toggleNewPasswordVisibility}
                  >
                    {newPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-white font-medium text-sm">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-3">Password Requirements:</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>

              {/* Save Password Button */}
              <button
                onClick={handlePasswordSave}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </section>

          {/* Two-Factor Authentication Section */}
          <section className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <Smartphone className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Two-Factor Authentication</h2>
            </div>

            <div className="space-y-6">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="two-factor" className="block text-white font-medium text-lg">
                    Enable Two-Factor Authentication
                  </label>
                  <p className="text-white/70 text-sm mt-1">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={toggleTwoFactor}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                    twoFactorEnabled ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* 2FA Status */}
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${twoFactorEnabled ? "bg-green-400" : "bg-red-400"}`}></div>
                  <span className="text-white font-medium">
                    Two-Factor Authentication is {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* 2FA Setup/Info */}
              {twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <h4 className="text-white font-semibold mb-3">How it works:</h4>
                    <p className="text-white/70 text-sm mb-4">
                      Two-factor authentication adds an extra layer of security to your account. You'll need to enter a
                      code from your authenticator app in addition to your password when signing in.
                    </p>
                    <div className="space-y-2">
                      <p className="text-white/70 text-sm">
                        • Download an authenticator app (Google Authenticator, Authy, etc.)
                      </p>
                      <p className="text-white/70 text-sm">• Scan the QR code or enter the setup key</p>
                      <p className="text-white/70 text-sm">• Enter the 6-digit code to verify setup</p>
                    </div>
                  </div>

                  <button
                    onClick={handleTwoFactorSetup}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Set Up Two-Factor Authentication</span>
                  </button>

                  {/* Backup Codes */}
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h4 className="text-white font-semibold mb-2">Backup Codes</h4>
                    <p className="text-white/70 text-sm mb-3">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your
                      authenticator device.
                    </p>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 text-sm">
                      Generate Backup Codes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-400/30">
                  <p className="text-yellow-100 text-sm">
                    <strong>Security Recommendation:</strong> Enable two-factor authentication to significantly improve
                    your account security.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Additional Security Options */}
          <section className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Additional Security</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-2">Login Notifications</h4>
                <p className="text-white/70 text-sm mb-3">Get notified when someone logs into your account</p>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 text-sm">
                  Configure
                </button>
              </div>

              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-2">Active Sessions</h4>
                <p className="text-white/70 text-sm mb-3">Manage devices that are currently logged in</p>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 text-sm">
                  View Sessions
                </button>
              </div>

              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-2">Security Log</h4>
                <p className="text-white/70 text-sm mb-3">Review recent security-related activities</p>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 text-sm">
                  View Log
                </button>
              </div>

              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <h4 className="text-white font-semibold mb-2">Account Recovery</h4>
                <p className="text-white/70 text-sm mb-3">Set up recovery options for your account</p>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 text-sm">
                  Setup Recovery
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
