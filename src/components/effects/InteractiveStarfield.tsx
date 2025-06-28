'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import type { Container } from '@tsparticles/engine';

export const InteractiveStarfield = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    console.log('Particles container loaded', container);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'repulse',
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          repulse: {
            distance: 80,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: ['#FFFFFF', '#FFD700', '#E67E22', '#D35400'],
        },
        links: {
          enable: false,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out',
          },
          random: false,
          speed: 0.2,
          straight: false,
          attract: {
            enable: true,
            rotate: {
              x: 300,
              y: 600,
            },
          },
        },
        number: {
          density: {
            enable: true,
          },
          value: 1200,
        },
        opacity: {
          value: { min: 0.3, max: 0.8 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false
          }
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 2.5 },
           animation: {
            enable: true,
            speed: 2,
            sync: false
          }
        },
      },
      detectRetina: true,
    } as any),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles-interactive"
        particlesLoaded={particlesLoaded}
        options={options}
        className="fixed inset-0 z-10"
      />
    );
  }

  return <></>;
}; 