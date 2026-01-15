import { logInfo } from "../utils/logger.js";

function isCampaignActiveNow(campaign, now = new Date()) {
  const start = new Date(campaign.start_at);
  const end = new Date(campaign.end_at);
  if (now < start || now > end) return false;

  // 0 = Sunday, 1 = Monday, ...
  const day = now.getDay();
  const mask = campaign.active_days ?? 127;
  const bit = 1 << day;
  return (mask & bit) !== 0;
}

export async function getActiveCampaignForDisplay(displayId) {
  const { data: campaigns, error } = await window.supabaseAPI.getCampaignsForDisplay(displayId);
  if (error || !campaigns || campaigns.length === 0) return null;

  const now = new Date();
  const active = campaigns.filter(c => isCampaignActiveNow(c, now));

  if (active.length === 0) return null;

  // scegli la campagna con priorità più alta
  active.sort((a, b) => b.priority - a.priority);
  const campaign = active[0];

  logInfo("Campagna attiva:", campaign.id);

  const { data: cps, error: errCp } = await window.supabaseAPI.getCampaignPlaylists(campaign.id);
  if (errCp || !cps || cps.length === 0) return { campaign, playlistId: null };

  // per ora prendi la prima playlist
  const playlistId = cps[0].playlist_id;

  return { campaign, playlistId };
}
