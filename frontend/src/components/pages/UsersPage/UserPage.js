"use client"

import { useState, useEffect } from "react"
import { Search, Download, MessageSquare, Ban, Trash2, Users, ChevronRight, X } from "lucide-react"
import { io } from "socket.io-client"
import axios from "axios"
import { toast } from "react-hot-toast"

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL + "/api" || "http://localhost:5000/api"
const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
})

const UsersPage = () => {
  // State management
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [filters, setFilters] = useState({
    dateJoined: "",
    interactionFrequency: "",
    sentiment: "",
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: {
          search: searchTerm,
          dateJoined: filters.dateJoined,
          interactionFrequency: filters.interactionFrequency,
          sentiment: filters.sentiment,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        },
      })

      setUsers(response.data.users)
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages,
        total: response.data.total,
      }))
      setError(null)
    } catch (err) {
      setError("Failed to fetch users")
      toast.error("Error loading users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server")
    })

    socket.on("newUser", (user) => {
      setUsers((prev) => [user, ...prev])
      toast.success("New user registered!")
    })

    socket.on("userUpdated", (updatedUser) => {
      setUsers((prev) => prev.map((user) => (user._id === updatedUser._id ? updatedUser : user)))
    })

    socket.on("userDeleted", (userId) => {
      setUsers((prev) => prev.filter((user) => user._id !== userId))
    })

    return () => {
      socket.off("connect")
      socket.off("newUser")
      socket.off("userUpdated")
      socket.off("userDeleted")
      socket.disconnect()
    }
  }, [])

  // Fetch users when filters or pagination changes
  useEffect(() => {
    fetchUsers()
  }, [searchTerm, filters, pagination.currentPage, pagination.itemsPerPage])

  // User actions
  const handleBanUser = async (userId) => {
    try {
      await axios.put(`${API_BASE_URL}/users/${userId}/ban`)
      toast.success("User banned successfully")
      fetchUsers()
    } catch (error) {
      toast.error("Failed to ban user")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`)
        toast.success("User deleted successfully")
        fetchUsers()
      } catch (error) {
        toast.error("Failed to delete user")
      }
    }
  }

  const handleSendMessage = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/messages/${userId}`)
      toast.success("Message sent successfully")
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  const handleExportData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/export`)
      const blob = new Blob([JSON.stringify(response.data)], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `user-${userId}-data.json`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("Failed to export user data")
    }
  }

  // Sentiment indicator component
  const SentimentIndicator = ({ value }) => {
    let backgroundColor = "#ef4444"
    if (value >= 0.7) backgroundColor = "#22c55e"
    else if (value >= 0.4) backgroundColor = "#eab308"

    return (
      <div className="w-full bg-white/20 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor,
            width: `${value * 100}%`,
          }}
        />
      </div>
    )
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-white text-lg">Loading users...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
          <p className="text-red-100 text-lg mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-white/70">View and manage users who interact with the bot</p>
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
        {/* Search and Filter Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 pl-12 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.dateJoined}
                onChange={(e) => setFilters({ ...filters, dateJoined: e.target.value })}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="" className="bg-purple-800 text-white">
                  Filter by Date Joined
                </option>
                <option value="last7days" className="bg-purple-800 text-white">
                  Last 7 days
                </option>
                <option value="last30days" className="bg-purple-800 text-white">
                  Last 30 days
                </option>
                <option value="last90days" className="bg-purple-800 text-white">
                  Last 90 days
                </option>
              </select>

              <select
                value={filters.interactionFrequency}
                onChange={(e) => setFilters({ ...filters, interactionFrequency: e.target.value })}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="" className="bg-purple-800 text-white">
                  Filter by Interaction Frequency
                </option>
                <option value="high" className="bg-purple-800 text-white">
                  High
                </option>
                <option value="medium" className="bg-purple-800 text-white">
                  Medium
                </option>
                <option value="low" className="bg-purple-800 text-white">
                  Low
                </option>
              </select>

              <select
                value={filters.sentiment}
                onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="" className="bg-purple-800 text-white">
                  Filter by Sentiment
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
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/20 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Last Interaction</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Interaction Count</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Sentiment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className="cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-white font-mono">{user._id}</td>
                    <td className="px-6 py-4 text-sm text-white">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-white">{new Date(user.lastInteraction).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-white">{user.interactionCount}</td>
                    <td className="px-6 py-4 text-sm text-white">
                      <div className="w-20">
                        <SentimentIndicator value={user.sentiment} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSendMessage(user._id)
                          }}
                          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 transition-colors border border-blue-400/30"
                          title="Send Message"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBanUser(user._id)
                          }}
                          className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 transition-colors border border-yellow-400/30"
                          title="Ban User"
                        >
                          <Ban size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteUser(user._id)
                          }}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-colors border border-red-400/30"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportData(user._id)
                          }}
                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-100 transition-colors border border-green-400/30"
                          title="Export Data"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Items per page */}
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">Items per page:</label>
              <select
                value={pagination.itemsPerPage}
                onChange={(e) =>
                  setPagination({
                    ...pagination,
                    itemsPerPage: Number(e.target.value),
                    currentPage: 1,
                  })
                }
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value={10} className="bg-purple-800 text-white">
                  10
                </option>
                <option value={25} className="bg-purple-800 text-white">
                  25
                </option>
                <option value={50} className="bg-purple-800 text-white">
                  50
                </option>
              </select>
            </div>

            {/* Page controls */}
            <div className="flex items-center space-x-4">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.max(1, prev.currentPage - 1),
                  }))
                }
                className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
              >
                Previous
              </button>
              <span className="text-white font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Panel */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">User Profile</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Information */}
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/70 text-sm">Name</p>
                      <p className="text-white font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Email</p>
                      <p className="text-white font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">User ID</p>
                      <p className="text-white font-mono text-sm">{selectedUser._id}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Date Joined</p>
                      <p className="text-white font-medium">{new Date(selectedUser.dateJoined).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Status</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedUser.status === "active"
                            ? "bg-green-500/20 text-green-100 border border-green-400/30"
                            : "bg-red-500/20 text-red-100 border border-red-400/30"
                        }`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interaction Summary */}
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Interaction Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/70 text-sm">Total Interactions</p>
                      <p className="text-white font-medium text-2xl">{selectedUser.interactionCount}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Last Interaction</p>
                      <p className="text-white font-medium">
                        {new Date(selectedUser.lastInteraction).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-white font-semibold mb-2">Sentiment Trend</h4>
                    <div className="w-full">
                      <SentimentIndicator value={selectedUser.sentiment} />
                      <p className="text-white/70 text-sm mt-1">
                        {(selectedUser.sentiment * 100).toFixed(1)}% positive sentiment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersPage
