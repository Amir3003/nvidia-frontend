const DEFAULT_RADAR_URL = 'https://raw.githubusercontent.com/Amir3003/nvidia-frontend/main/public/data/opportunities.json';

export async function loadRadar(limit = 5) {
  const response = await fetch(process.env.RADAR_DATA_URL || DEFAULT_RADAR_URL, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Radar feed returned HTTP ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Radar feed is not a list');
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  return data.flatMap((item) => {
    const title = String(item?.title || '').trim();
    const url = String(item?.url || '').trim();
    if (!title || !/^https:\/\/[^\s]+$/i.test(url)) return [];
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(item.deadline || '') ? item.deadline : null;
    if (deadline && deadline < today) return [];
    const key = `${title.toLowerCase()}|${url}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      title: title.slice(0, 160),
      url,
      deadline,
      type: String(item.type || 'Opportunity').slice(0, 40),
      organization: String(item.organization || '').trim().slice(0, 80),
    }];
  }).slice(0, limit);
}
