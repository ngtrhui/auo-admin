/**
 * `fetch` trên Node (undici) yêu cầu giá trị header là ByteString (từng byte 0–255).
 * Nếu dùng trực tiếp chuỗi UTF-8 sẽ lỗi: "Cannot convert argument to a ByteString".
 * Percent-encode tạo chuỗi ASCII an toàn. Phía API nên dùng `decodeURIComponent` khi đọc.
 */
export function encodeHeaderValueForHttp(value: string): string {
    if (!value) return "";
    return encodeURIComponent(value);
}
