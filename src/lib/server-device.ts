import { cookies } from "next/headers";
import {
    AUO_DEVICE_ID_COOKIE,
    AUO_DEVICE_NAME_COOKIE,
    AUO_LOCATION_COOKIE,
} from "./device-cookie-names";

function safeDecode(v: string | undefined): string {
    if (!v) return "";
    try {
        return decodeURIComponent(v);
    } catch {
        return v;
    }
}

/**
 * Thông tin thiết bị cho fetch chạy trên server (NextAuth, v.v.).
 * Cần client gọi `syncDeviceHeadersToCookies()` (vd. từ SessionShell) để cookie gắn theo request.
 */
export async function getServerDeviceHeaders(): Promise<{
    "x-device-id": string;
    "x-device-name": string;
    "x-location": string;
}> {
    try {
        const c = await cookies();
        return {
            "x-device-id": c.get(AUO_DEVICE_ID_COOKIE)?.value ?? "",
            "x-device-name": safeDecode(c.get(AUO_DEVICE_NAME_COOKIE)?.value),
            "x-location": safeDecode(c.get(AUO_LOCATION_COOKIE)?.value),
        };
    } catch {
        return {
            "x-device-id": "",
            "x-device-name": "",
            "x-location": "",
        };
    }
}
