export function getMemberInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function withPhotoCacheBuster(profilePhotoUrl: string | null | undefined, version?: string | null) {
  if (!profilePhotoUrl) {
    return null;
  }

  if (profilePhotoUrl.startsWith("data:")) {
    return profilePhotoUrl;
  }

  if (!version) {
    return profilePhotoUrl;
  }

  const separator = profilePhotoUrl.includes("?") ? "&" : "?";
  return `${profilePhotoUrl}${separator}v=${encodeURIComponent(version)}`;
}
