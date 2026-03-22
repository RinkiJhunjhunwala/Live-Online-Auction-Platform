export function formatCountdown(ms) {
  if (ms <= 0) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');
  
  return `${mStr}:${sStr}`;
}
