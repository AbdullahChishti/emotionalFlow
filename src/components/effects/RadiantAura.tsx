'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { ISourceOptions, Container } from '@tsparticles/engine';
import { loadFull } from 'tsparticles'; // "full" bundle includes the polygon mask plugin

export const RadiantAura = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // The "full" bundle should include everything, no need for separate plugin loading
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    // You can add logic here if needed once particles are loaded
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: {
        color: { value: 'transparent' },
      },
      // Starfield background
      particles: {
        number: {
          value: 350,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ['#FFFFFF', '#FFD700', '#ADD8E6'],
        },
        shape: {
          type: 'star',
        },
        opacity: {
          value: { min: 0.3, max: 0.8 },
          animation: {
            enable: true,
            speed: 0.5,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 2.5 },
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'out',
          },
          random: true,
          speed: 0.1,
          straight: false,
        },
      },
      // The radiant aura effect
      emitters: {
        position: { x: 50, y: 50 },
        rate: {
          quantity: 2,
          delay: 0.1,
        },
        particles: {
          color: {
            value: [
              "#ff0000", "#ff7f00", "#ffff00", "#00ff00",
              "#0000ff", "#4b0082", "#8f00ff"
            ],
          },
          move: {
            direction: "out" as const,
            speed: { min: 1, max: 3 },
            trail: {
              enable: true,
              fill: { color: "#111827" },
              length: 5,
            },
          },
          opacity: {
            value: {min: 0.2, max: 0.6}
          },
          size: {
            value: {min: 20, max: 40},
            animation: {
                enable: true,
                speed: 4,
                startValue: "min" as const,
                destroy: "max" as const,
            }
          },
          life: {
            duration: {
              value: 3
            },
            count: 1
          }
        },
      },
      // Central bright core
      manualParticles: [{
        position: { x: 50, y: 48 }, // Centered on the chest area
        particle: {
          shape: {
            type: "circle",
          },
          size: {
            value: 80,
          },
          color: {
            value: "#ffffff",
          },
          opacity: {
            value: 0.9,
            animation: {
              enable: true,
              speed: 0.5,
              sync: false,
              startValue: "max" as const,
              destroy: "min" as const,
              loop: true,
            }
          }
        }
      }],
      detectRetina: true,
    }),
    [],
  );
  
  if (init) {
    return (
      <>
        <div
          className="absolute inset-0 z-10 w-full h-full"
          style={{
            maskImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOTIgNTEyIj48cGF0aCBkPSJNODguMSA3MEwxMjggMzJjMTUtMTUgNDEtNCA0MSAyMHY0MDBjMCAyNC0yNiAzNS00MSAyMEwxMjggNDgwSDY0TDQxLjcgNDU3Yy00LjcgNC43LTEyLjMgNC43LTE3IDBsLTE3LTE3Yy00LjEtNC4xLTYuMy05LjUtNi4zLTE1LjF2LTYwLjJjMC0xMS4zIDULjEtMjEuOSA5LjYtMjkuN2wzMC45LTUxLjRDODggMjg5LjUgOTYgMjY0LjMgOTYgMjM5LjJ2LTI2LjRjMC0yNS4xLTcuOS01MC4yLTIzLjEtNzAuOEw0My4xIDExMS44Yy00LjUtNy44LTkuNi0xOC40LTkuNi0yOS43VjIyLjljMC01LjUgMi4yLTEwLjkgNi4zLTE1LjFsMTctMTdjNC43LTQuNyAxMi4zLTQuNyAxNyAwbDIyLjMgMjMuMWMyMC45IDIxLjIgMzEuOSA0OS42IDMxLjkgNzguOVYxNTljMC0xOC45LTIuMy0zNy44LTYuOS01NS44bC01LjktMjMuMnpNODAgMjM5LjJjMCAxNS4zLTQuNiAzMC4xLTEyLjggNDIuOEw0MS4xIDM1Mi4zYy0xLjggMy00LjIgNC43LTYuNyA0LjdoLTEuN2MtMi41IDAtNS0xLjctNi43LTQuN2wtLjYtLjZjLTEuMy0xLjMtMi0zLTItNC44di00My41YzAtMy4xIDEuMi02LjIgMy40LTYuOWwxLjUtLjNjMi4xLS40IDQuMy40IDUuNSAydjE5LjljMCAyLjIgMS44IDQgNCA0czQtMS44IDQtNGwzMi0zMi4xYzEyLjktMTIuOSAxOS45LTMwIDE5LjktNDguMlYxNzlDNzIgMTYyLjYgNjQuMiAxMzIgNDguMiAxMTZsLTE3LjEtMTcuMWMtNC43LTQuNy0xMi4zLTQuNy0xNyAwbC0xNyAxN2MtNC4xIDQuMS02LjMgOS41LTYuMyAxNS4xdjIyLjVjMCAzLjEgMS4yIDYuMSAzLjMgOC4ybDMwLjggNTEuNGMyNS41IDQyLjQgMzkuNiA5NC4zIDM5LjYgMTQ5LjRWNDMyYzAgMi4yIDEuOCA0IDQgNHM0LTEuOCA0LTRWMTIwYzAtMi4yLTEuOC00LTQtNHMtNC0xLjgtNC00bDEyLjItMTIuMmM0LjctNC43IDEyLjMtNC43IDE3IDBsMTcuMSAxNy4xQzExMi43IDIzMC45IDEyOCAyNjEuMyAxMjggMjk0djEwYzAgMi4yIDEuOCA0IDQgNHM0LTEuOCA0LTR2LTkuNWMwLTIzLjktNy43LTQ2LjYtMjIuMy02NC44TDc0LjYgMTg2LjRjLTEyLjktMTIuOS0xOS45LTMwLTE5LjktNDguMlYxMjBjMC0yLjEtMS43LTMuOC0zLjgtMy44cy0zLjggMS43LTMuOCAzeiIvPjwvc3ZnPg==)',
            maskSize: 'auto 60%',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        >
          <Particles
            id="tsparticles-aura"
            options={options}
            particlesLoaded={particlesLoaded}
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-200 via-white to-gray-200" />
      </>
    );
  }

  return <></>;
}; 