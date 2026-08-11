import { Card } from '@/components/ui/Card';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { ChakraSidebar } from './chakra-player/ChakraSidebar';
import { ChakraHeroPlayer } from './chakra-player/ChakraHeroPlayer';
import { QuickActionCards } from './chakra-player/QuickActionCards';
import { PlayerOptionsPanel } from './chakra-player/PlayerOptionsPanel';
import { TrackInfoPanel } from './chakra-player/TrackInfoPanel';
import { QuoteCard } from './chakra-player/QuoteCard';
import { TrustBadgesRow } from './chakra-player/TrustBadgesRow';

/**
 * Thin orchestrator — all state lives in the global ChakraPlayerContext (so it survives
 * navigating to other pages, backing the sitewide docked mini player), all visual regions
 * are decomposed into src/tools/chakra-player/*. Responsive: lg:grid-cols-[240px_1fr] for
 * the sidebar split, nested xl:grid-cols-[1fr_300px] for hero-vs-right-rail — the one width
 * where three real columns fit inside the site's existing max-w-7xl container. Below lg,
 * the sidebar collapses to a horizontal chip row and the right-rail panels stack below.
 */
export default function ChakraFrequencyPlayerTool() {
  const player = useChakraPlayer();

  if (!player.supported) {
    return (
      <Card className="p-6 sm:p-8">
        <p className="text-sm text-white/70">
          Your browser doesn&apos;t support the Web Audio API needed for this player. Try a recent version of Chrome,
          Firefox, Edge or Safari.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
      <ChakraSidebar />
      <div className="space-y-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_300px] xl:items-start">
          <div className="space-y-8">
            <ChakraHeroPlayer />
            <QuickActionCards />
          </div>
          <div className="space-y-6">
            <PlayerOptionsPanel />
            <TrackInfoPanel />
            <QuoteCard />
          </div>
        </div>
        <TrustBadgesRow />
      </div>
    </div>
  );
}
