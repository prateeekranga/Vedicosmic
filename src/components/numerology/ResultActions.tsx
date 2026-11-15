import { useState } from 'react';
import { Check, Link as LinkIcon, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SaveOnDeviceButton } from '@/components/device/SaveOnDeviceButton';
import { useToast } from '@/contexts/ToastContext';
import { buildResultLink, type ResultLinkData } from '@/lib/resultLink';
import { requestPrintOptions } from '@/lib/print/printSettings';
import { trackEvent } from '@/lib/analytics';

/**
 * Save, copy-link and print for a numerology result.
 * - Save keeps a short summary of numbers on this device (after consent), never the birth date.
 * - Copy link builds a link containing the date of birth only when pressed, and says so.
 * - Print opens the report's print options (PrintReport), where a PDF can also be saved.
 */
export function ResultActions({
  toolSlug, link, onSave, saveLabel = 'Save this result', printable = true,
}: {
  toolSlug: string;
  /** Omit for results that depend on a name or phone number, which are never put in a link. */
  link?: ResultLinkData;
  onSave: () => void;
  saveLabel?: string;
  printable?: boolean;
}) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const copy = async () => {
    if (!link) return;
    trackEvent('share_clicked', { channel: 'result-link', tool: toolSlug });
    try {
      await navigator.clipboard.writeText(buildResultLink(toolSlug, link));
      setCopied(true);
      notify('Link copied. It contains your date of birth.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notify('Could not copy the link in this browser.', 'info');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <SaveOnDeviceButton label={saveLabel} size="sm" saved={saved} onSave={() => { onSave(); setSaved(true); }} />
        {link && (
          <Button variant="ghost" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />} Copy link with my birth date
          </Button>
        )}
        {printable && (
          <Button variant="ghost" size="sm" onClick={() => { if (!requestPrintOptions()) window.print(); }}>
            <Printer className="h-4 w-4" /> Print or save PDF
          </Button>
        )}
      </div>
      {link && (
        <p className="text-xs text-white/55">
          The link includes your date of birth, so share it only with people you are happy to tell. Nothing is sent to us.
        </p>
      )}
    </div>
  );
}
