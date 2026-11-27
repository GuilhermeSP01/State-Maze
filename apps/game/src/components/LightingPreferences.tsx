import { createContext, useContext, useState, type ReactNode } from 'react';
import type { LightingOptions } from './BoardLighting';

type Preferences = {
  lighting: LightingOptions;
  changeLighting: (option: keyof LightingOptions, enabled: boolean) => void;
};

const LightingContext = createContext<Preferences | null>(null);

const lightingKey = 'state-maze.lighting';

function loadLighting(): LightingOptions {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(lightingKey) ?? '{}');
  } catch {
    // Storage can be unavailable in a restricted webview.
  }
  return { penumbra: saved?.penumbra !== false, bloom: saved?.bloom !== false };
}

export function LightingProvider({ children }: { children: ReactNode }) {
  const [lighting, setLighting] = useState(loadLighting);
  function changeLighting(option: keyof LightingOptions, enabled: boolean) {
    const updated = { ...lighting, [option]: enabled };
    setLighting(updated);
    try {
      localStorage.setItem(lightingKey, JSON.stringify(updated));
    } catch {
      // The choice still applies to the current session.
    }
  }

  return <LightingContext.Provider value={{ lighting, changeLighting }}>{children}</LightingContext.Provider>;
}

export function useLighting() {
  const preferences = useContext(LightingContext);
  if (!preferences) throw new Error('LightingProvider is required.');
  return preferences;
}
