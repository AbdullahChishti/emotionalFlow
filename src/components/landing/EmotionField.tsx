'use client'

import React, { useRef, useEffect } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface EmotionFieldProps {
  particleColor?: string
  lineColor?: string
  particleCount?: number
}

export function EmotionField({
  particleColor = 'rgba(147, 51, 234, 0.4)', // purple-500 with opacity
  lineColor = 'rgba(147, 51, 234, 0.1)',
  particleCount = 70,
}: EmotionFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const resizeCanvas = () => {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }

    class Particle {
      x: number
      y: number
      radius: number
      vx: number
      vy: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.radius = Math.random() * 2 + 1
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
      }

      draw() {
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx!.fillStyle = particleColor
        ctx!.fill()
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1
      }
    }

    const init = () => {
      resizeCanvas()
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const distance = Math.sqrt(
            (particles[i].x - particles[j].x) ** 2 +
            (particles[i].y - particles[j].y) ** 2
          )

          if (distance < 120) {
            ctx!.strokeStyle = lineColor
            ctx!.lineWidth = 0.5
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.stroke()
          }
        }
      }
    }

    const animate = () => {
      if (prefersReducedMotion) {
        // Draw a single static frame
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
        particles.forEach(p => p.draw())
        connectParticles()
        return
      }

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      particles.forEach(p => {
        p.update()
        p.draw()
      })
      connectParticles()
      animationFrameId = window.requestAnimationFrame(animate)
    }

    init()
    animate()

    window.addEventListener('resize', init)

    return () => {
      window.removeEventListener('resize', init)
      cancelAnimationFrame(animationFrameId)
    }
  }, [particleColor, lineColor, particleCount])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-20"
    />
  )
}
