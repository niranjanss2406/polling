/**
 * Utility formatters for PULSE
 */

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'N/A';
  }
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return formatDate(dateString);
  } catch {
    return '';
  }
}

export function formatTimeRemaining(dateString) {
  if (!dateString) return null;
  try {
    const target = new Date(dateString).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 1) return `${days} days left`;
    if (days === 1) return '1 day left';
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  } catch {
    return null;
  }
}

export function formatPercentage(count, total, precision = 1) {
  if (!total || total === 0) return '0%';
  const pct = (count / total) * 100;
  return `${pct.toFixed(precision).replace(/\.0$/, '')}%`;
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function truncateText(text, maxLength = 80) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function isPollActive(poll) {
  if (!poll) return false;
  if (poll.status === 'closed') return false;
  if (poll.expires_at) {
    const exp = new Date(poll.expires_at).getTime();
    if (exp <= Date.now()) return false;
  }
  return true;
}

