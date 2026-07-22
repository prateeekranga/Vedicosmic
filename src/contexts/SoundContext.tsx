import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Ambient, toolSceneDef } from '@/lib/ambient';
import { audioConfig } from '@/config/audio';

interface SoundCtx {
  enabled: boolean;
  toggle: () => void;
  beginTratak: (ambient: boolean) => void;
  endTratak: () => void;
  enterTool: (category: string, seed: string) => void;
  exitTool: () => void;
  speak: (text: string, lang?: 'en' | 'hi') => void;
  stopSpeak: () => void;
}
const Ctx = createContext<SoundCtx>({
  enabled: true, toggle: () => {}, beginTratak: () => {}, endTratak: () => {},
  enterTool: () => {}, exitTool: () => {}, speak: () => {}, stopSpeak: () => {},
});
export const useSound = () => useContext(Ctx);

/** Manages the site-wide ambient background music, per-tool soundscapes and Trataka audio/voice. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(() => {
    try { const s = localStorage.getItem('vc.music'); return s === null ? audioConfig.background.enabled : s === 'on'; }
    catch { return audioConfig.background.enabled; }
  });
  const enabledRef = useRef(enabled); enabledRef.current = enabled;

  // try to start immediately; browsers will resume it on the first gesture (ms later)
  useEffect(() => {
    if (enabledRef.current) { Ambient.unlock(); Ambient.startBackground(); }
    let done = false;
    const onFirst = () => {
      if (done) return; done = true;
      Ambient.unlock();
      if (enabledRef.current) Ambient.startBackground();
      window.removeEventListener('pointerdown', onFirst);
      window.removeEventListener('keydown', onFirst);
    };
    window.addEventListener('pointerdown', onFirst);
    window.addEventListener('keydown', onFirst);
    return () => { window.removeEventListener('pointerdown', onFirst); window.removeEventListener('keydown', onFirst); };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('vc.music', next ? 'on' : 'off'); } catch { /* */ }
      if (next) { Ambient.unlock(); Ambient.startBackground(); }
      else { Ambient.stopBackground(); Ambient.endTratak(); Ambient.exitTool(); Ambient.stopSpeak(); }
      return next;
    });
  }, []);

  const beginTratak = useCallback((ambient: boolean) => { Ambient.unlock(); Ambient.beginTratak(ambient); }, []);
  const endTratak = useCallback(() => { Ambient.endTratak(); Ambient.stopSpeak(); }, []);
  const enterTool = useCallback((category: string, seed: string) => {
    if (!enabledRef.current) return;
    Ambient.unlock(); Ambient.enterTool(toolSceneDef(category, seed));
  }, []);
  const exitTool = useCallback(() => { Ambient.exitTool(); }, []);
  const speak = useCallback((t: string, lang?: 'en' | 'hi') => Ambient.speak(t, lang), []);
  const stopSpeak = useCallback(() => Ambient.stopSpeak(), []);

  return (
    <Ctx.Provider value={{ enabled, toggle, beginTratak, endTratak, enterTool, exitTool, speak, stopSpeak }}>
      {children}
    </Ctx.Provider>
  );
}
