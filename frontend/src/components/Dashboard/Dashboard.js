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
} from "lucide-react"
import { dashboardAPI } from "../../services/api"
import "./Dashboard.css"
import {
  BotInteraction,
  EmbedOptions,
  InteractionLog,
  PersonalitySettings,
  ScenarioPanel,
  UsersPage,
  SettingsPage,
} from "../pages"
// Add the import for StarsBackground at the top of the file
import StarsBackground from "./StarsBackground.tsx"

const Dashboard = () => {
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

  // Update the THEME object with more vibrant colors
  const THEME = {
    primary: "#8b5cf6",
    secondary: "#6366f1",
    accent1: "#06b6d4",
    accent2: "#ec4899",
    accent3: "#10b981",
    background: "#0f172a",
    cardBg: "#1e293b",
    text: "#e2e8f0",
    textLight: "#94a3b8",
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

    const socket = new WebSocket("ws://localhost:5000")

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

  // Update the renderSidebar function to include the updated styling
  const renderSidebar = () => (
    <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        {sidebarOpen && <h2 className="logo">AI Bot Platform</h2>}
        <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav className="nav-menu">
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            {sidebarOpen && <span>{item.label}</span>}
          </div>
        ))}
      </nav>
    </div>
  )

  // Update the renderStats function to include RGB values for accent colors
  const renderStats = () => (
    <div className="stats-grid">
      {dashboardData.stats.map((stat, index) => {
        // Convert hex to RGB for CSS variables
        const hexToRgb = (hex) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          return result
            ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
            : null
        }

        return (
          <div
            key={index}
            className="stat-card"
            style={{
              "--accent-color": stat.color,
              "--accent-color-rgb": hexToRgb(stat.color),
            }}
          >
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-icon">
                <stat.icon size={20} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">
              <span className={`change-badge ${Number.parseFloat(stat.change) >= 0 ? "positive" : "negative"}`}>
                {stat.change}
              </span>
              <span className="change-label">from last month</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderChart = (title, children) => (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  )

  const renderInteractionTrends = () => (
    <div className="col-span-2">
      {renderChart(
        "Interaction Trends",
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.interactionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.textLight}25`} />
              <XAxis dataKey="_id.date" stroke={THEME.textLight} />
              <YAxis stroke={THEME.textLight} />
              <Tooltip
                contentStyle={{
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.textLight}25`,
                }}
              />
              <Legend />
              {["chat", "email", "voice", "appointment"].map((type, index) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={`_id.${type}`}
                  stroke={Object.values(THEME)[index]}
                  strokeWidth={2}
                  dot={false}
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
                outerRadius={80}
                fill={THEME.primary}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData.channelMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(THEME)[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.textLight}25`,
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
              <CartesianGrid strokeDasharray="3 3" stroke={`${THEME.textLight}25`} />
              <XAxis dataKey="name" stroke={THEME.textLight} />
              <YAxis stroke={THEME.textLight} />
              <Tooltip
                contentStyle={{
                  background: THEME.cardBg,
                  border: `1px solid ${THEME.textLight}25`,
                }}
              />
              <Bar dataKey="value" fill={THEME.primary}>
                {Object.entries(dashboardData.personalityEffectiveness).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(THEME)[index % Object.values(THEME).length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>,
      )}
    </div>
  )

  const MainDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1 className="dashboard-title">AI Bot Analytics</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
          </button>
          <div className="profile-avatar"></div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {renderStats()}
          <div className="charts-grid">
            <div className="chart-wide">{renderInteractionTrends()}</div>
            <div className="chart-normal">{renderChannelDistribution()}</div>
            <div className="chart-normal">{renderPersonalityMetrics()}</div>
          </div>
        </>
      )}
    </div>
  )

  // Update the return statement in the Dashboard component to include StarsBackground
  return (
    <div className="dashboard-container" style={{ background: THEME.background }}>
      <StarsBackground />
      {renderSidebar()}
      <div className={`main-content ${sidebarOpen ? "sidebar-open" : ""}`}>
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
