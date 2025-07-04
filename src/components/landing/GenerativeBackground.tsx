'use client'

import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { useState, useRef } from 'react'

const pastelColors = ['#a7c7e7', '#f2b5d4', '#d1b3e2'] // Pastel Blue, Pink, Lavender

interface ParticleLayerProps {
  count: number;
  size: number;
  zPosition: number;
  speedFactor: number;
}

function ParticleLayer({ count, size, zPosition, speedFactor }: ParticleLayerProps) {
  const { viewport, mouse } = useThree()
  const pointsRef = useRef<any>(null)

  const particles = useState(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      positions.set([
        (Math.random() - 0.5) * viewport.width * 2,
        (Math.random() - 0.5) * viewport.height * 2,
        zPosition + (Math.random() - 0.5) * 2,
      ], i * 3)
      velocities.set([0, 0, 0], i * 3)
      color.set(pastelColors[Math.floor(Math.random() * pastelColors.length)])
      colors.set([color.r, color.g, color.b], i * 3)
    }
    return { positions, velocities, colors }
  })[0]

  useFrame(() => {
    const { positions, velocities } = particles
    const targetX = mouse.x * viewport.width / 2
    const targetY = mouse.y * viewport.height / 2

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const x = positions[i3]
      const y = positions[i3 + 1]

      const dx = targetX - x
      const dy = targetY - y
      const distSq = dx * dx + dy * dy
      const force = -1 / (distSq + 0.01)

      velocities[i3] += dx * force * 0.01 * speedFactor
      velocities[i3 + 1] += dy * force * 0.01 * speedFactor

      velocities[i3] *= 0.96
      velocities[i3 + 1] *= 0.96

      positions[i3] += velocities[i3]
      positions[i3 + 1] += velocities[i3 + 1]

      if (positions[i3] > viewport.width) positions[i3] = -viewport.width
      if (positions[i3] < -viewport.width) positions[i3] = viewport.width
      if (positions[i3 + 1] > viewport.height) positions[i3 + 1] = -viewport.height
      if (positions[i3 + 1] < -viewport.height) positions[i3 + 1] = viewport.height
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <Points ref={pointsRef} positions={particles.positions} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export function GenerativeBackground() {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#a7c7e7] via-[#f2b5d4] to-[#d1b3e2]">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        {/* Background layer - small, slow, dense */}
        <ParticleLayer count={2000} size={0.01} zPosition={-5} speedFactor={0.5} />
        {/* Midground layer - medium size, normal speed */}
        <ParticleLayer count={1500} size={0.025} zPosition={0} speedFactor={1} />
        {/* Foreground layer - large, fast, sparse (bokeh) */}
        <ParticleLayer count={500} size={0.05} zPosition={4} speedFactor={1.5} />
      </Canvas>
    </div>
  )
}
