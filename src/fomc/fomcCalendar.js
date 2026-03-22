// FOMC Meeting dates 2025 and 2026
// Source: federalreserve.gov/monetarypolicy/fomccalendars.htm
const FOMC_DATES = [
  // 2025
  '2025-01-29', '2025-03-19', '2025-05-07', '2025-06-18',
  '2025-07-30', '2025-09-17', '2025-10-29', '2025-12-10',
  // 2026
  '2026-01-28', '2026-03-18', '2026-04-29', '2026-06-17',
  '2026-07-29', '2026-09-16', '2026-10-28', '2026-12-09',
];

/**
 * Returns info about proximity to upcoming FOMC meeting
 */
function getFomcStatus() {
  const now = new Date();
  const upcoming = FOMC_DATES
    .map(d => new Date(d + 'T14:00:00-05:00')) // 2pm ET announcement
    .filter(d => d >= now)
    .sort((a, b) => a - b);

  const next = upcoming[0];
  if (!next) return { isImminent: false, daysUntil: null, date: null };

  const msUntil = next - now;
  const hoursUntil = msUntil / (1000 * 60 * 60);
  const daysUntil = Math.ceil(hoursUntil / 24);
  const isImminent = hoursUntil <= 72;
  const isSameDay = daysUntil <= 1;

  return {
    isImminent,
    isSameDay,
    daysUntil,
    hoursUntil: Math.round(hoursUntil),
    date: next.toISOString().split('T')[0],
    label: isSameDay ? 'FOMC TODAY' : `FOMC in ${daysUntil}d`,
  };
}

module.exports = { getFomcStatus, FOMC_DATES };
