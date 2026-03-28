const PROFILE_IMAGE_MAP_KEY = "veristake_profile_images";

const PLACEHOLDER_IMAGES = [
  "/download%20(4).jpg",
  "/download%20(5).jpg",
  "/Alternates%20in%20graphics%20variants%20%F0%9F%A4%9F%F0%9F%8F%BD%E2%9C%A8_%23art%20%23cameraroll.jpg",
  "/%D0%9D%D0%B0%20%D0%B0%D0%B2%D1%83.jpg",
  "/placeholder-5.svg",
];

type ProfileImageMap = Record<string, string>;

function safeReadImageMap(): ProfileImageMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(PROFILE_IMAGE_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as ProfileImageMap;
  } catch {
    return {};
  }
}

function safeWriteImageMap(imageMap: ProfileImageMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PROFILE_IMAGE_MAP_KEY,
      JSON.stringify(imageMap),
    );
  } catch {
    // Ignore localStorage write failures.
  }
}

export function getRandomPlaceholderImage() {
  const index = Math.floor(Math.random() * PLACEHOLDER_IMAGES.length);
  return PLACEHOLDER_IMAGES[index];
}

export function getDefaultPlaceholderByProfileId(profileId: bigint) {
  const index = Number(profileId % BigInt(PLACEHOLDER_IMAGES.length));
  return PLACEHOLDER_IMAGES[index];
}

export function saveProfileImageForId(profileId: bigint, imageUrl: string) {
  const imageMap = safeReadImageMap();
  imageMap[profileId.toString()] = imageUrl;
  safeWriteImageMap(imageMap);
}

export function isPlaceholderImage(imageUrl: string) {
  return imageUrl.startsWith("/");
}

export function getProfileImageForId(profileId: bigint) {
  const imageMap = safeReadImageMap();
  return (
    imageMap[profileId.toString()] ||
    getDefaultPlaceholderByProfileId(profileId)
  );
}
