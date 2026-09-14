let sessionExpired = false;

export function isSessionExpired() {
  return sessionExpired;
}

export function markSessionExpired() {
  sessionExpired = true;
}

export function resetSessionExpiredFlag() {
  sessionExpired = false;
}
