"use client"

import { useState } from "react"
import {
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Mail,
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  Building,
  Zap,
} from "lucide-react"

const ScenarioPanel = () => {
  const [activeTab, setActiveTab] = useState("assumptions")

  const scenarios = [
    {
      name: "Baseline",
      description: "Current trajectory",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Optimistic",
      description: "Accelerated growth",
      icon: BarChart3,
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Pessimistic",
      description: "Economic downturn",
      icon: TrendingUp,
      color: "from-red-500 to-orange-500",
    },
    {
      name: "Disruption",
      description: "Major industry shifts",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
    },
  ]

  const drivers = [
    { name: "GDP Growth", icon: TrendingUp },
    { name: "Inflation", icon: DollarSign },
    { name: "Unemployment", icon: Users },
    { name: "Interest Rates", icon: BarChart3 },
    { name: "Consumer Spending", icon: DollarSign },
    { name: "Business Investment", icon: Building },
  ]

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
              <span className="text-white font-medium">Azhar</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">Scenario Planning</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Explore the potential impact of different economic conditions on your business with our advanced scenario
              modeling.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
              {[
                { id: "assumptions", label: "Key Assumptions" },
                { id: "scenarios", label: "Scenario Models" },
                { id: "impact", label: "Business Impact" },
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

          {/* Content Sections */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Key Economic Drivers Section */}
            <section className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Key Economic Drivers</h2>
                <p className="text-white/80 max-w-2xl mx-auto">
                  Monitor the variables that have the greatest influence on your business performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((driver, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <driver.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg">{driver.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Scenario Models Section */}
            <section className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Scenario Models</h2>
                <p className="text-white/80 max-w-2xl mx-auto">
                  Analyze how your business may perform under different economic conditions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${scenario.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                      >
                        <scenario.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-xl mb-2">{scenario.name}</h3>
                        <p className="text-white/70">{scenario.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Additional Content Based on Active Tab */}
            {activeTab === "assumptions" && (
              <section className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Key Assumptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <h4 className="text-white font-semibold mb-2">Economic Growth Rate</h4>
                      <p className="text-white/70 text-sm">Expected annual GDP growth between 2-4%</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <h4 className="text-white font-semibold mb-2">Market Volatility</h4>
                      <p className="text-white/70 text-sm">Moderate fluctuations in key market indicators</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <h4 className="text-white font-semibold mb-2">Technology Adoption</h4>
                      <p className="text-white/70 text-sm">Accelerated digital transformation across industries</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <h4 className="text-white font-semibold mb-2">Regulatory Environment</h4>
                      <p className="text-white/70 text-sm">Stable policy framework with gradual changes</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "impact" && (
              <section className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Business Impact Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">+15%</div>
                      <div className="text-white font-medium mb-1">Revenue Growth</div>
                      <div className="text-white/70 text-sm">Optimistic Scenario</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">+5%</div>
                      <div className="text-white font-medium mb-1">Revenue Growth</div>
                      <div className="text-white/70 text-sm">Baseline Scenario</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-400 mb-2">-8%</div>
                      <div className="text-white font-medium mb-1">Revenue Growth</div>
                      <div className="text-white/70 text-sm">Pessimistic Scenario</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm border-t border-white/20 px-8 py-12 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-white text-xl font-bold mb-4">Analytics Depot</h3>
              <p className="text-white/70 mb-6">
                Empowering businesses with advanced analytics and AI integration solutions.
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
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Solutions
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Legal
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70">© 2024 Analytics Depot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ScenarioPanel
