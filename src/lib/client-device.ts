import {
  AUO_DEVICE_ID_COOKIE,
  AUO_DEVICE_NAME_COOKIE,
  AUO_LOCATION_COOKIE,
} from "./device-cookie-names";

const DEVICE_ID_KEY = "auo_device_id";
const LOCATION_KEY = "auo_x_location";
/** Session: đã hết cách lấy vị trí — tránh gọi geolocation lặp mỗi request (Safari/macOS hay gặp). */
const LOCATION_SESSION_GIVEUP_KEY = "auo_x_location_giveup";

const isDev = process.env.NODE_ENV === "development";

function devLog(...args: unknown[]) {
  if (isDev) {
    console.log("[client-device]", ...args);
  }
}

let memLocation: string | null = null;
let locationPromise: Promise<void> | null = null;
let lastHeadersLogAt = 0;

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function getDeviceName(): string {
  if (typeof navigator === "undefined") return "";
  return (navigator.userAgent || "unknown").slice(0, 512);
}

function readCachedLocation(): string {
  if (memLocation !== null) return memLocation;
  if (typeof window === "undefined") return "";
  try {
    const v = localStorage.getItem(LOCATION_KEY);
    if (v) {
      memLocation = v;
      return v;
    }
  } catch {
    /* ignore */
  }
  return "";
}

function setClientDeviceCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const enc = encodeURIComponent(value);
  document.cookie = `${name}=${enc}; path=/; max-age=31536000; SameSite=Lax`;
}

function setCachedLocation(s: string): void {
  memLocation = s;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCATION_KEY, s);
    }
  } catch {
    /* ignore */
  }
  if (s) {
    try {
      sessionStorage.removeItem(LOCATION_SESSION_GIVEUP_KEY);
    } catch {
      /* ignore */
    }
  }
  setClientDeviceCookie(AUO_LOCATION_COOKIE, s);
}

/**
 * Ghi thông tin thiết bị vào cookie để `getServerDeviceHeaders` (NextAuth) đọc được.
 * Gọi từ client sau khi trang tải (vd. SessionShell).
 */
export function syncDeviceHeadersToCookies() {
  if (typeof window === "undefined") return;
  const h = getClientDeviceHeaders();
  setClientDeviceCookie(AUO_DEVICE_ID_COOKIE, h["x-device-id"]);
  setClientDeviceCookie(AUO_DEVICE_NAME_COOKIE, h["x-device-name"]);
  setClientDeviceCookie(AUO_LOCATION_COOKIE, h["x-location"]);
}

function formatReverseGeocode(data: {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
}): string {
  const parts: string[] = [];
  if (data.locality) parts.push(data.locality);
  if (data.city && data.city !== data.locality) parts.push(data.city);
  if (!parts.length && data.principalSubdivision) {
    parts.push(data.principalSubdivision);
  }
  return parts.filter(Boolean).join(", ");
}

function formatGeojsLike(data: {
  city?: string;
  region?: string;
  country?: string;
}): string {
  const parts: string[] = [];
  if (data.city) parts.push(data.city);
  if (data.region && data.region !== data.city) parts.push(data.region);
  if (!parts.length && data.country) parts.push(data.country);
  return parts.filter(Boolean).join(", ");
}

function getCurrentPositionOnce(
  options: PositionOptions,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("geolocation not available"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Nhiều môi trường (macOS, Safari) cần dò lại: maximumAge: 0, timeout dài, lần 2 bật highAccuracy.
 */
async function getCoordsWithRetries(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }
  const attempts: PositionOptions[] = [
    { enableHighAccuracy: false, maximumAge: 0, timeout: 30_000 },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 45_000 },
  ];
  for (const opt of attempts) {
    try {
      const pos = await getCurrentPositionOnce(opt);
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
    } catch (e) {
      devLog("getCurrentPosition thất bại, thử cấu hình kế (macOS thường cần lần 2):", e);
    }
  }
  return null;
}

async function reverseGeocodeBigData(
  latitude: number,
  longitude: number,
): Promise<string> {
  const r = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      String(latitude),
    )}&longitude=${encodeURIComponent(
      String(longitude),
    )}&localityLanguage=default`,
  );
  if (!r.ok) return "";
  const data = (await r.json()) as {
    locality?: string;
    city?: string;
    principalSubdivision?: string;
  };
  return formatReverseGeocode(data);
}

/**
 * Dự phòng khi API chính lỗi; Nominatim cần User-Agent tử tế (một phần trình duyệt tự gửi).
 */
async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number,
): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");
  const r = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "vi,en",
    },
  });
  if (!r.ok) return "";
  const data = (await r.json()) as {
    address?: {
      city?: string;
      town?: string;
      village?: string;
      municipality?: string;
      state?: string;
      region?: string;
    };
  };
  const a = data.address;
  if (!a) return "";
  const place =
    a.city ?? a.town ?? a.village ?? a.municipality ?? a.region ?? "";
  const sub = a.state && a.state !== place ? a.state : "";
  const parts = [place, sub].filter(Boolean);
  return parts.join(", ");
}

/** Gần đúng theo IP — không cần quyền vị trí (hữu ích khi user từ chối / mac lỗi Wi‑Fi). */
async function tryApproximateLocationFromIP(): Promise<string> {
  const r = await fetch("https://get.geojs.io/v1/ip/geo.json");
  if (!r.ok) return "";
  const data = (await r.json()) as {
    city?: string;
    region?: string;
    country?: string;
  };
  return formatGeojsLike(data);
}

function isLocationGiveupSet(): boolean {
  try {
    return sessionStorage.getItem(LOCATION_SESSION_GIVEUP_KEY) === "1";
  } catch {
    return false;
  }
}

function setLocationGiveup(): void {
  try {
    sessionStorage.setItem(LOCATION_SESSION_GIVEUP_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Cập nhật vị trí (ví dụ: "Thủ Đức, Hồ Chí Minh") trong nền khi chưa có cache.
 * Có quyền vị trí → GPS/Wi‑Fi; thất bại → thử theo IP; lần 1/phiên không lặp vô tận.
 */
function startLocationRefresh(): void {
  if (typeof window === "undefined" || locationPromise) return;
  if (readCachedLocation()) return;
  if (isLocationGiveupSet()) return;

  locationPromise = (async () => {
    let str = "";
    try {
      const coords = await getCoordsWithRetries();

      if (coords) {
        try {
          str = await reverseGeocodeBigData(
            coords.latitude,
            coords.longitude,
          );
        } catch (e) {
          devLog("reverseGeocode (bigdatacloud) lỗi, thử Nominatim…", e);
        }
        if (!str) {
          try {
            str = await reverseGeocodeNominatim(
              coords.latitude,
              coords.longitude,
            );
          } catch (e) {
            /* Nominatim thường lỗi CORS/429 từ trình duyệt; bỏ qua. */
            devLog("reverseGeocode (nominatim) không dùng được", e);
          }
        }
      }

      if (!str) {
        try {
          str = await tryApproximateLocationFromIP();
        } catch (e) {
          devLog("vị trí theo IP thất bại", e);
        }
      }

      if (str) {
        setCachedLocation(str);
        devLog("x-location đã cập nhật:", str);
        syncDeviceHeadersToCookies();
      } else {
        setLocationGiveup();
        if (isDev) {
          console.warn(
            "[client-device] không lấy được vị trí (GPS/IP); bỏ qua tới hết phiên (tránh lặp).",
          );
        }
      }
    } catch (err) {
      setLocationGiveup();
      if (isDev) {
        console.warn("[client-device] không lấy được vị trí:", err);
      }
    } finally {
      locationPromise = null;
    }
  })();
}

/** Header gửi kèm mọi request từ trình duyệt. */
export function getClientDeviceHeaders(): Record<string, string> {
  if (typeof window !== "undefined") {
    startLocationRefresh();
  }
  const headers = {
    "x-device-id": getOrCreateDeviceId(),
    "x-device-name": getDeviceName(),
    "x-location": readCachedLocation(),
  };
  if (isDev) {
    const now = Date.now();
    if (now - lastHeadersLogAt > 2000) {
      lastHeadersLogAt = now;
      devLog("headers (tối đa ~2s/lần):", headers);
    }
  }
  return headers;
}
