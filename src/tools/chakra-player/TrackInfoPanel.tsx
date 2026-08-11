import { Download, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useChakraPlayer } from '@/hooks/useChakraPlayer';
import { getPreset, PRESETS } from '@/data/chakraPresets';

/** The honest reframing of the reference image's file-metadata panel: no fake Duration,
 *  Format, License or Source, since none of that exists for a live-synthesized tone. The
 *  optional record-and-download feature is folded in here as the panel's action row. */
export function TrackInfoPanel() {
  const player = useChakraPlayer();
  const active = getPreset(player.activePreset) ?? PRESETS[0];

  return (
    <Card className="p-6">
      <p className="eyebrow mb-4">Track Information</p>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Tone</dt>
          <dd className="text-right text-white">{active.name} · {active.sanskrit}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Bija</dt>
          <dd className="text-right" style={{ color: active.color }}>{active.bija}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Frequency</dt>
          <dd className="text-right font-mono text-white">{active.freq} Hz</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/45">Source</dt>
          <dd className="text-right text-white">Live Synthesis · Web Audio API</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-white/40">
        Nothing here is a recording — every tone is generated fresh in your browser, so there&apos;s no file, format
        or license to speak of.
      </p>

      {player.recordingSupported && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="text-sm font-medium text-white">Record a clip</p>
          <p className="mt-1 text-xs text-white/45">Capture up to 10 minutes of the current tone as a downloadable file.</p>
          <div className="mt-3">
            {!player.isRecording ? (
              <Button variant="outline" size="sm" disabled={!player.isPlaying} onClick={player.startRecording}>
                <Download className="mr-2 h-4 w-4" /> Start recording
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={player.stopRecording}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Stop &amp; download
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
