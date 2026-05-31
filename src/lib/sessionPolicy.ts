/** Sign out members and admins after this much idle time (20–30 minute policy). */
export const SESSION_INACTIVITY_TIMEOUT_MS = 25 * 60 * 1000;

export const SESSION_INACTIVITY_TIMEOUT_MINUTES = SESSION_INACTIVITY_TIMEOUT_MS / 60_000;

/** Keep server session alive while the tab is active. */
export const SESSION_HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

export const SESSION_EXPIRED_MESSAGE =
  "Your session expired due to inactivity. Sign in again to continue.";
