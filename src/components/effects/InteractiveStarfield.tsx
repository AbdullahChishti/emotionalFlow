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
            mode: ["grab", "bubble"],
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          grab: {
            distance: 250,
            links: {
              color: "#ffffff",
              opacity: 0.3,
            },
          },
          bubble: {
            distance: 200,
            size: 2,
            duration: 1,
            opacity: 1,
          },
        },
      },
      particles: {
        color: {
          value: ['#ffffff', '#f2f2f2', '#e6e6e6', '#d9d9d9'],
        },
        links: {
          color: "random",
          distance: 150,
          enable: true,
          opacity: 0.1,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: true,
          speed: 0.1,
          straight: false,
          attract: {
            enable: true,
            rotate: {
              x: 1200,
              y: 1200,
            },
          },
        },
        number: {
          density: {
            enable: true,
            value_area: 800,
          },
          value: 300,
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: {
            enable: true,
            speed: 0.2,
            sync: false,
          },
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 0.5, max: 1.5 },
           animation: {
            enable: true,
            speed: 1,
            sync: false,
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