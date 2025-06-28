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
          value: '#0d1117',
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
            distance: 60,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: '#ffffff',
        },
        links: {
          enable: false,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: 0.1,
          straight: false,
          attract: {
            enable: true,
            rotate: {
              x: 600,
              y: 1200,
            },
          },
        },
        number: {
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
          value: 400,
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 0.5, max: 1.5 },
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
        className="fixed inset-0 z-0"
      />
    );
  }

  return <></>;
}; 