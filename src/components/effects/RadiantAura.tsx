'use client';

import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import type { ISourceOptions } from '@tsparticles/engine';

export const RadiantAura = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: {
        color: { value: 'transparent' },
      },
      particles: {
        number: {
          value: 15, // Fewer, larger particles
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: ['#C9B8DB', '#A8C09A', '#A3C1DA', '#F5E6D3'], // Therapeutic palette
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.1, max: 0.4 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        size: {
          value: { min: 50, max: 150 }, // Large, soft orbs
          animation: {
            enable: true,
            speed: 4,
            sync: false,
          },
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out',
          },
          random: true,
          speed: 0.2, // Very slow, gentle movement
          straight: false,
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'repulse', // Gently push particles away on hover
          },
        },
        modes: {
          repulse: {
            distance: 150,
            duration: 0.4,
          },
        },
      },
      detectRetina: true,
      style: {
        filter: 'blur(50px)', // Core of the aura effect
      }
    }),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles-aura"
        options={options}
        className="fixed inset-0 z-0"
      />
    );
  }

  return <></>;
}; 