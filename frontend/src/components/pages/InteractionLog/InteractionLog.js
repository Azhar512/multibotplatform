"use client"

import { useState, useEffect } from "react"
import { Search, Download, Printer, RefreshCw, Flag, Archive, Trash2, ChevronRight } from "lucide-react"
import io from "socket.io-client"

const InteractionLog = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedUser, setSelectedUser] = useState("all")
  const [selectedSentiment, setSelectedSentiment] = useState("all")
  const [selectedInteraction, setSelectedInteraction] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [interactions, setInteractions] = useState([])
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    recentInteractions: 0,
    sentimentDistribution: {},
    averageResponseTime: 0,
  })
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL)

    newSocket.on("connect", () => {
      setIsConnected(true)
      console.log("Connected to WebSocket")
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
      console.log("Disconnected from WebSocket")
    })

    setSocket(newSocket)
    return () => newSocket.disconnect()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("newInteraction", ({ interaction }) => {
      setInteractions((prev) => {
        const updated = [interaction, ...prev]
        return updated.slice(0, itemsPerPage)
      })
    })

    socket.on("analyticsUpdate", (metrics) => {
      setRealTimeMetrics(metrics)
    })

    socket.on("personalityUpdate", (settings) => {
      console.log("Personality settings updated:", settings)
    })

    return () => {
      socket.off("newInteraction")
      socket.off("analyticsUpdate")
      socket.off("personalityUpdate")
    }
  }, [socket, itemsPerPage])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (socket) {
        socket.emit("searchInteractions", {
          query: searchQuery,
          filters: {
            startDate,
            endDate,
            userId: selectedUser,
            sentiment: selectedSentiment,
          },
        })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, startDate, endDate, selectedUser, selectedSentiment, socket])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleReset = () => {
    setSearchQuery("")
    setStartDate("")
    setEndDate("")
    setSelectedUser("all")
    setSelectedSentiment("all")

    if (socket) {
      socket.emit("resetFilters")
    }
  }

  const handleStatusUpdate = (id, status) => {
    if (socket) {
      socket.emit("updateInteractionStatus", { id, status })
    }
  }

  const handleExport = (format) => {
    if (socket) {
      socket.emit("exportRequest", { format })
    }
  }

  const ConnectionStatus = () => (
    <div
      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
        isConnected
          ? "bg-green-500/20 text-green-100 border border-green-400/30"
          : "bg-red-500/20 text-red-100 border border-red-400/30"
      }`}
    >
      <RefreshCw className={`w-4 h-4 ${isConnected ? "animate-spin" : ""}`} />
      <span>{isConnected ? "Live" : "Reconnecting..."}</span>
    </div>
  )

  const MetricsDisplay = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-white/70 text-sm font-medium mb-2">Active Users</h3>
        <p className="text-3xl font-bold text-white">{realTimeMetrics.activeUsers}</p>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-white/70 text-sm font-medium mb-2">Recent Interactions</h3>
        <p className="text-3xl font-bold text-white">{realTimeMetrics.recentInteractions}</p>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-white/70 text-sm font-medium mb-2">Avg Response Time</h3>
        <p className="text-3xl font-bold text-white">{realTimeMetrics.averageResponseTime}ms</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Interaction Log</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></div>
              <span className="text-white font-medium">Azhar</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Metrics Display */}
        <MetricsDisplay />

        {/* Filters Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search interactions..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 pl-12 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="all" className="bg-purple-800 text-white">
                  All Users
                </option>
                <option value="user123" className="bg-purple-800 text-white">
                  John Doe
                </option>
                <option value="user456" className="bg-purple-800 text-white">
                  Jane Smith
                </option>
              </select>
              <select
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="all" className="bg-purple-800 text-white">
                  All Sentiments
                </option>
                <option value="positive" className="bg-purple-800 text-white">
                  Positive
                </option>
                <option value="neutral" className="bg-purple-800 text-white">
                  Neutral
                </option>
                <option value="negative" className="bg-purple-800 text-white">
                  Negative
                </option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleReset}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Interaction Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Message</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Bot Response</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Sentiment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {interactions.map((interaction) => (
                  <tr
                    key={interaction.id}
                    onClick={() => setSelectedInteraction(interaction)}
                    className={`cursor-pointer hover:bg-white/10 transition-colors ${
                      selectedInteraction?.id === interaction.id ? "bg-white/20" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-white">{new Date(interaction.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-white">{interaction.userName}</td>
                    <td className="px-6 py-4 text-sm text-white max-w-xs truncate">{interaction.userMessage}</td>
                    <td className="px-6 py-4 text-sm text-white max-w-xs truncate">{interaction.botResponse}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          interaction.sentiment === "positive"
                            ? "bg-green-500/20 text-green-100 border border-green-400/30"
                            : interaction.sentiment === "negative"
                              ? "bg-red-500/20 text-red-100 border border-red-400/30"
                              : "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30"
                        }`}
                      >
                        {interaction.sentiment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Panel */}
        {selectedInteraction && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Interaction Details</h2>

            <div className="space-y-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {selectedInteraction.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">{selectedInteraction.userName}</p>
                    <p className="text-white/90">{selectedInteraction.userMessage}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">Bot</p>
                    <p className="text-white/90">{selectedInteraction.botResponse}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusUpdate(selectedInteraction.id, "flagged")}
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 px-4 py-2 rounded-lg font-medium transition-colors border border-yellow-400/30 flex items-center space-x-2"
              >
                <Flag size={16} />
                <span>Flag</span>
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedInteraction.id, "archived")}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 px-4 py-2 rounded-lg font-medium transition-colors border border-blue-400/30 flex items-center space-x-2"
              >
                <Archive size={16} />
                <span>Archive</span>
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedInteraction.id, "deleted")}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded-lg font-medium transition-colors border border-red-400/30 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Export Options */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport("csv")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport("print")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30 flex items-center space-x-2"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
            </div>

            {/* Pagination */}
            <div className="flex items-center space-x-4">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="10" className="bg-purple-800 text-white">
                  10 per page
                </option>
                <option value="20" className="bg-purple-800 text-white">
                  20 per page
                </option>
                <option value="50" className="bg-purple-800 text-white">
                  50 per page
                </option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
                >
                  Previous
                </button>
                <span className="text-white font-medium">Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractionLog
