const STORAGE_PREFIX = "bluewave:kyc-verified-notice";

function noticeKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function hasSeenKycVerifiedNotice(userId: string) {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(noticeKey(userId)) === "1";
}

export function markKycVerifiedNoticeSeen(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(noticeKey(userId), "1");
}
