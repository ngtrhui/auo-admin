"use client";

import { useState, useEffect } from "react";

/**
 * Trả về giá trị debounced - chỉ cập nhật sau khi value không thay đổi trong `delay` ms.
 * Hữu ích cho search input để giảm số lần gọi API.
 *
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian chờ (ms), mặc định 300
 * @returns Giá trị debounced
 */
export function useDebounce<T>(
    value: T,
    delay = 500,
    onDebounced?: (debounced: T) => void,
): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
            onDebounced?.(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay, onDebounced]);

    return debouncedValue;
}
