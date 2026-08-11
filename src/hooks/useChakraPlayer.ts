// Thin re-export shim — the real implementation now lives in ChakraPlayerContext
// (a Provider mounted once at the app root in src/App.tsx) so playback survives
// route navigation. Every consumer keeps calling useChakraPlayer() with the exact
// same shape as before; only where the state lives has changed.
export { useChakraPlayerContext as useChakraPlayer } from '@/contexts/ChakraPlayerContext';
export type { SleepMinutes, UseChakraPlayerReturn } from '@/contexts/ChakraPlayerContext';
