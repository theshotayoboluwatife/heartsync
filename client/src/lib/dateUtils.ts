// Optimized date utilities - replaces date-fns with lightweight alternatives
// This reduces bundle size by removing locale dependencies

/**
 * Format distance to now in French
 * Lightweight alternative to date-fns formatDistanceToNow
 */
export function formatDistanceToNow(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'à l\'instant';
  } else if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 7) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInWeeks < 4) {
    return `il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
  } else if (diffInMonths < 12) {
    return `il y a ${diffInMonths} mois`;
  } else {
    return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
  }
}

/**
 * Format date to French format
 * Lightweight alternative to date-fns format
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const day = targetDate.getDate().toString().padStart(2, '0');
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const year = targetDate.getFullYear().toString();
  const hours = targetDate.getHours().toString().padStart(2, '0');
  const minutes = targetDate.getMinutes().toString().padStart(2, '0');
  
  return formatStr
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const today = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  return today.toDateString() === targetDate.toDateString();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  return yesterday.toDateString() === targetDate.toDateString();
}

/**
 * Get relative time in French
 */
export function getRelativeTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(targetDate)) {
    return 'Aujourd\'hui';
  } else if (isYesterday(targetDate)) {
    return 'Hier';
  } else {
    return formatDistanceToNow(targetDate);
  }
}

/**
 * Format time only (HH:mm)
 */
export function formatTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return formatDate(targetDate, 'HH:mm');
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  return formatDate(targetDate, 'dd/MM/yyyy HH:mm');
}

export function formatUTCTimestamp(utcTimestamp: string): string {
  try {
    if (!utcTimestamp) return "";

    // Convert UTC timestamp to local time and format as 12-hour
    const gameDate = new Date(utcTimestamp);

    // Check if the date is valid
    if (isNaN(gameDate.getTime())) {
      console.error("Invalid UTC timestamp:", utcTimestamp);
      return "";
    }

    const displayTime = gameDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return displayTime;
  } catch (error) {
    console.error("Error formatting UTC timestamp:", error);
    return "";
  }
}
