"use client";

import { useEffect, useRef, useState } from "react";

import { showToast } from "@/components/ui/Toaster";
import {
  INITIAL_PATTERNS,
  LEGACY_PATTERNS_STORAGE_KEY,
  PATTERNS_STORAGE_KEY,
} from "@/data/pattern";
import type { Pattern } from "@/components/modules/pattern/pattern.types";

function isPatterns(value: unknown): value is Pattern[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        "id" in item &&
        typeof item.id === "string" &&
        "name" in item &&
        typeof item.name === "string" &&
        "description" in item &&
        typeof item.description === "string",
    )
  );
}

export function usePatterns() {
  const [patterns, setPatterns] = useState(INITIAL_PATTERNS);
  const [storageReady, setStorageReady] = useState(false);
  const canWriteStorage = useRef(true);

  useEffect(() => {
    let loadedPatterns = INITIAL_PATTERNS;
    try {
      const storedPatterns =
        window.localStorage.getItem(PATTERNS_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_PATTERNS_STORAGE_KEY);

      if (storedPatterns !== null) {
        const parsedPatterns: unknown = JSON.parse(storedPatterns);
        if (!isPatterns(parsedPatterns)) {
          throw new Error("Dữ liệu kiểu mẫu đã lưu không hợp lệ.");
        }
        loadedPatterns = parsedPatterns;
      }
    } catch (error) {
      console.error("Không thể tải danh sách kiểu mẫu.", error);
      showToast("error", "Không thể tải danh sách kiểu mẫu đã lưu.");
      return;
    }

    queueMicrotask(() => {
      setPatterns(loadedPatterns);
      setStorageReady(true);
    });
  }, []);

  useEffect(() => {
    if (!storageReady || !canWriteStorage.current) return;

    try {
      window.localStorage.setItem(
        PATTERNS_STORAGE_KEY,
        JSON.stringify(patterns),
      );
    } catch (error) {
      console.error("Không thể lưu danh sách kiểu mẫu.", error);
      showToast("error", "Không thể lưu danh sách kiểu mẫu.");
      canWriteStorage.current = false;
    }
  }, [patterns, storageReady]);

  return { patterns, setPatterns };
}
