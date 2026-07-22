import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from 'react';

interface ShareContextValue {
  resultText: string | null;
  setResultText: (text: string | null) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

/** Scopes a tool's personalized share text to its own mount — wrap each tool page instance with a fresh `key`. */
export function ShareResultProvider({ children }: { children: ReactNode }) {
  const [resultText, setResultText] = useState<string | null>(null);
  return (
    <ShareContext.Provider value={{ resultText, setResultText }}>{children}</ShareContext.Provider>
  );
}

function useShareContext(): ShareContextValue {
  const ctx = useContext(ShareContext);
  if (!ctx) throw new Error('useShareResult/useShareText must be used inside ShareResultProvider');
  return ctx;
}

/** A tool calls this with its current personalized one-line result (or null when there's nothing to share yet). */
export function useShareResult(text: string | null) {
  const { setResultText } = useShareContext();
  useEffect(() => {
    setResultText(text);
    return () => setResultText(null);
  }, [text, setResultText]);
}

/** ToolPage reads the active tool's personalized share text, falling back to a generic line when there's none. */
export function useShareText(): string | null {
  return useShareContext().resultText;
}
