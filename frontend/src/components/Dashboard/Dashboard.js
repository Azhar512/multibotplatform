"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  X,
  Bot,
  Link,
  Clock,
  Brain,
  PlaySquare,
  ChevronRight,
} from "lucide-react"
import { dashboardAPI } from "../../services/api"
import { useUser } from "../../contexts/UserContext"
import {
  BotInteraction,
  EmbedOptions,
  InteractionLog,
  PersonalitySettings,
  ScenarioPanel,
  UsersPage,
  SettingsPage,
} from "../pages"

const Dashboard = () => {
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    interactionTrends: [],
    personalityEffectiveness: {},
    channelMetrics: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Enhanced theme with gradient colors
  const THEME = {
    primary: "#8b5cf6",
    secondary: "#6366f1",
    accent1: "#06b6d4",
    accent2: "#ec4899",
    accent3: "#10b981",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    cardBg: "rgba(255, 255, 255, 0.1)",
    text: "#ffffff",
    textLight: "rgba(255, 255, 255, 0.7)",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#f87171",
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [statsData, trendsData, effectivenessData] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getInteractionTrends(),
          dashboardAPI.getPersonalityEffectiveness(),
        ])

        if (!statsData.success || !trendsData.success || !effectivenessData.success) {
          throw new Error("Failed to fetch dashboard data")
        }

        setDashboardData({
          stats: [
            {
              title: "Total Interactions",
              value: statsData.data.totalInteractions.toLocaleString(),
              change: `${((statsData.data.totalInteractions / statsData.data.previousPeriod.totalInteractions - 1) * 100).toFixed(1)}%`,
              icon: MessageSquare,
              color: THEME.primary,
            },
            {
              title: "Success Rate",
              value: `${statsData.data.successRate.toFixed(1)}%`,
              change: `${(statsData.data.successRate - statsData.data.previousPeriod.successRate).toFixed(1)}%`,
              icon: Bot,
              color: THEME.secondary,
            },
            {
              title: "Active Users",
              value: statsData.data.activeUsers.toLocaleString(),
              change: `${((statsData.data.activeUsers / statsData.data.previousPeriod.activeUsers - 1) * 100).toFixed(1)}%`,
              icon: Users,
              color: THEME.accent1,
            },
            {
              title: "Avg Response Time",
              value: `${(statsData.data.averageResponseTime / 1000).toFixed(2)}s`,
              change: `${((1 - statsData.data.averageResponseTime / statsData.data.previousPeriod.averageResponseTime) * 100).toFixed(1)}%`,
              icon: Clock,
              color: THEME.accent2,
            },
          ],
          interactionTrends: trendsData.data,
          personalityEffectiveness: effectivenessData.data,
          channelMetrics: [
            { name: "Chat", value: statsData.data.interactionsByType.chat || 0 },
            { name: "Email", value: statsData.data.interactionsByType.email || 0 },
            { name: "Voice", value: statsData.data.interactionsByType.voice || 0 },
            { name: "Appointment", value: statsData.data.interactionsByType.appointment || 0 },
          ],
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    const socket = new WebSocket(process.env.REACT_APP_WS_URL || "ws://localhost:5000")
    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data)
      if (newData.type === "statsUpdate") {
        setDashboardData((prevData) => ({
          ...prevData,
          stats: prevData.stats.map((stat) => ({
            ...stat,
            value: newData[stat.title.toLowerCase().replace(" ", "_")] || stat.value,
          })),
        }))
      }
    }

    return () => socket.close()
  }, [])

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Bot, label: "Bot Interaction", path: "/bot-interaction" },
    { icon: Link, label: "Embed Options", path: "/embed-options" },
    { icon: Clock, label: "Interaction Log", path: "/interaction-log" },
    { icon: Brain, label: "Personality Settings", path: "/personality-settings" },
    { icon: PlaySquare, label: "Scenario Panel", path: "/scenario-panel" },
    { icon: Users, label: "Users", path: "/users" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ]

  const renderSidebar = () => (
    <div
      className={`fixed left-0 top-0 h-full bg-white/10 backdrop-blur-sm border-r border-white/20 transition-all duration-300 z-50 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        {sidebarOpen && <h2 className="text-xl font-bold text-white">AI Bot Platform</h2>}
        <button
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              location.pathname === item.path ? "bg-white text-purple-600 shadow-lg" : "text-white hover:bg-white/20"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </div>
        ))}
      </nav>
    </div>
  )

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {dashboardData.stats.map((stat, index) => {
        const hexToRgb = (hex) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          return result
            ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
            : null
        }

        return (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group"
            style={{
              "--accent-color": stat.color,
              "--accent-color-rgb": hexToRgb(stat.color),
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 text-sm font-medium">{stat.title}</span>
              <div
                className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `rgba(${hexToRgb(stat.color)}, 0.2)` }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  Number.parseFloat(stat.change) >= 0
                    ? "bg-green-500/20 text-green-100 border border-green-400/30"
                    : "bg-red-500/20 text-red-100 border border-red-400/30"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-white/50 text-xs">from last month</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderChart = (title, children) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      {children}
    </div>
  )

  const renderInteractionTrends = () => (
    <div className="lg:col-span-2">
      {renderChart(
        "Interaction Trends",
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.interactionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="_id.date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                }}
              />
              <Legend />
              {["chat", "email", "voice", "appointment"].map((type, index) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={`_id.${type}`}
                  stroke={Object.values(THEME).slice(0, 4)[index]}
                  strokeWidth={3}
                  dot={{ fill: Object.values(THEME).slice(0, 4)[index], strokeWidth: 2, r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>,
      )}
    </div>
  )

  const renderChannelDistribution = () => (
    <div>
      {renderChart(
        "Channel Distribution",
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.channelMetrics}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill={THEME.primary}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.channelMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(THEME).slice(0, 4)[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>,
      )}
    </div>
  )

  const renderPersonalityMetrics = () => (
    <div>
      {renderChart(
        "Personality Effectiveness",
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(dashboardData.personalityEffectiveness).map(([key, value]) => ({
                name: key,
                value,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                }}
              />
              <Bar dataKey="value" fill={THEME.primary} radius={[4, 4, 0, 0]}>
                {Object.entries(dashboardData.personalityEffectiveness).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(THEME).slice(0, 4)[index % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>,
      )}
    </div>
  )

  const MainDashboard = () => (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Bot Analytics</h1>
          <p className="text-white/70">Monitor your AI bot performance and user interactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-3 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <span className="text-white font-medium">{user?.name || 'User'}</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {renderStats()}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderInteractionTrends()}
            {renderChannelDistribution()}
            {renderPersonalityMetrics()}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 relative">
      {renderSidebar()}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <Routes>
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/bot-interaction" element={<BotInteraction />} />
          <Route path="/embed-options" element={<EmbedOptions />} />
          <Route path="/interaction-log" element={<InteractionLog />} />
          <Route path="/personality-settings" element={<PersonalitySettings />} />
          <Route path="/scenario-panel" element={<ScenarioPanel />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default Dashboard
