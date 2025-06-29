'use client';

import dynamic from "next/dynamic";

const RadiantAura = dynamic(
  () => import('@/components/effects/RadiantAura').then(mod => mod.RadiantAura),
  { ssr: false }
);

export function ClientRadiantAura() {
  return <RadiantAura />;
}
