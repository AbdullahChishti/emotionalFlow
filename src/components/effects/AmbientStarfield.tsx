'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';

export const AmbientStarfield = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: {
        color: { value: 'transparent' },
      },
      particles: {
        number: {
          value: 60,
        },
        color: {
          value: '#555',
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 0.1, max: 0.3 },
        },
        size: {
          value: { min: 1, max: 2 },
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out',
          },
          random: true,
          speed: 0.05,
          straight: false,
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: false,
          },
        },
      },
      detectRetina: true,
    } as any),
    [],
  );
  
  if (init) {
    return (
      <Particles
        id="tsparticles-ambient"
        options={options}
        className="fixed inset-0 z-0"
      />
    );
  }

  return <></>;
}; 