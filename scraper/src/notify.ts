export interface ScrapeResult {
  visaType: string;
  visaName: string;
  status: 'success' | 'no_changes' | 'failed';
  totalPostcodes: number;
  changesDetected: number;
  postcodesAffected: number;
  pageModifiedDate: string | null;
  durationMs: number;
  error?: string;
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: { name: string; value: string; inline: boolean }[];
  timestamp: string;
}

const COLOR_SUCCESS = 0x2ecc71; // green
const COLOR_NO_CHANGES = 0x3498db; // blue
const COLOR_FAILURE = 0xe74c3c; // red

/**
 * Send a Discord webhook notification about a scrape result.
 * No-op if DISCORD_WEBHOOK_URL is not set.
 */
export async function sendNotification(result: ScrapeResult): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('DISCORD_WEBHOOK_URL not set, skipping notification');
    return;
  }

  const embed = buildEmbed(result);

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!response.ok) {
    console.warn(`Discord webhook failed: ${response.status} ${response.statusText}`);
  }
}

function buildEmbed(result: ScrapeResult): DiscordEmbed {
  const durationSec = Math.round(result.durationMs / 1000);

  if (result.status === 'failed') {
    return {
      title: `Scrape ${result.visaType} - FAILED`,
      description: result.error ?? 'Unknown error',
      color: COLOR_FAILURE,
      fields: [
        { name: 'Visa', value: result.visaName, inline: true },
        { name: 'Duration', value: `${durationSec}s`, inline: true },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  if (result.status === 'no_changes') {
    return {
      title: `Scrape ${result.visaType} - No changes`,
      description: `Page modified: ${result.pageModifiedDate ?? 'unknown'}`,
      color: COLOR_NO_CHANGES,
      fields: [
        { name: 'Postcodes', value: String(result.totalPostcodes), inline: true },
        { name: 'Duration', value: `${durationSec}s`, inline: true },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  // success with changes
  return {
    title: `Scrape ${result.visaType} - ${result.changesDetected} changes detected`,
    description: `Page modified: ${result.pageModifiedDate ?? 'unknown'}`,
    color: COLOR_SUCCESS,
    fields: [
      { name: 'Postcodes', value: String(result.totalPostcodes), inline: true },
      { name: 'Affected', value: String(result.postcodesAffected), inline: true },
      { name: 'Changes', value: String(result.changesDetected), inline: true },
      { name: 'Duration', value: `${durationSec}s`, inline: true },
    ],
    timestamp: new Date().toISOString(),
  };
}
