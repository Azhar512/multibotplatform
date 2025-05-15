"use client"

import React, { useEffect } from "react"

export default function StarsBackground() {
  useEffect(() => {
    // Get the container element using querySelector instead of ref
    const container = document.querySelector('.stars-container')
    if (!container) return
    
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Create stars
    const starCount = Math.floor((containerWidth * containerHeight) / 10000)
    
    for (let i = 0; i < starCount; i++) {
      const size = Math.random() * 2 + 1
      const x = Math.random() * containerWidth
      const y = Math.random() * containerHeight
      const opacity = Math.random() * 0.7 + 0.3
      const duration = Math.random() * 3 + 2
      const delay = Math.random() * 5
      
      const starElement = document.createElement("div")
      starElement.className = "star"
      starElement.style.width = `${size}px`
      starElement.style.height = `${size}px`
      starElement.style.left = `${x}px`
      starElement.style.top = `${y}px`
      starElement.style.setProperty("--opacity", opacity.toString())
      starElement.style.setProperty("--duration", `${duration}s`)
      starElement.style.setProperty("--delay", `${delay}s`)
      container.appendChild(starElement)
    }

    // Create particles
    const particleCount = 15
    const colors = ["#8b5cf6", "#6366f1", "#ec4899", "#06b6d4", "#10b981"]

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 100 + 50
      const x = Math.random() * containerWidth
      const y = Math.random() * containerHeight
      const color = colors[Math.floor(Math.random() * colors.length)]
      const duration = Math.random() * 20 + 10
      const delay = Math.random() * 5
      const distance = Math.random() * 100 + 50
      
      const particleElement = document.createElement("div")
      particleElement.className = "particle"
      particleElement.style.width = `${size}px`
      particleElement.style.height = `${size}px`
      particleElement.style.left = `${x}px`
      particleElement.style.top = `${y}px`
      particleElement.style.setProperty("--color", color)
      particleElement.style.setProperty("--duration", `${duration}s`)
      particleElement.style.setProperty("--delay", `${delay}s`)
      particleElement.style.setProperty("--distance", `${distance}px`)
      container.appendChild(particleElement)
    }

    return () => {
      const container = document.querySelector('.stars-container')
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
    }
  }, [])

  return <div className="stars-container" style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }} />
}