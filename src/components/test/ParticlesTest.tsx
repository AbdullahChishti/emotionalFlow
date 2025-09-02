'use client'

import { useCallback } from 'react'
import { Particles } from "@tsparticles/react"
import { loadFull } from "tsparticles"
import type { Engine } from "@tsparticles/engine"

export function ParticlesTest() {
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log('Initializing particles engine...')
    await loadFull(engine)
    console.log('Particles engine initialized!')
  }, [])

  const particlesLoaded = useCallback(async (container: any) => {
    console.log('Particles loaded!', container)
  }, [])

  return (
    <div className="relative w-full h-screen bg-black">
      <h1 className="absolute top-10 left-10 text-white text-2xl z-10">
        Particles Test
      </h1>
      
      <Particles
        id="tsparticles-test"
        url=""
        className="absolute inset-0"
        options={{
          fullScreen: { enable: false },
          background: { color: "transparent" },
          particles: {
            number: { value: 50 },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.8 },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "out" },
            },
            links: {
              enable: true,
              distance: 150,
              color: "#ffffff",
              opacity: 0.4,
              width: 1,
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  )
}
