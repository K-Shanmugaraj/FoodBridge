export function formatDateTime(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
  
  export function toInputDateTime(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  
  export function isExpired(expiryTime) {
    if (!expiryTime) return false;
    return new Date(expiryTime) <= new Date();
  }
  
  export function getTimeRemaining(expiryTime) {
    const diff = new Date(expiryTime) - new Date();
    if (diff <= 0) return 'Expired';
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hrs >= 24) {
      const days = Math.floor(hrs / 24);
      return `${days}d ${hrs % 24}h left`;
    }
    return `${hrs}h ${mins}m left`;
  }
  
  export function extractErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
    const data = err?.response?.data;
    if (!data) return err?.message || fallback;
    if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.entries(data.fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(' | ');
    }
    return data.message || data.error || fallback;
  }