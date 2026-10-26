"use client";

import { useEffect, useRef, useState } from "react";

import { showToast } from "@/components/ui/Toaster";
import type { Yarn } from "@/components/modules/yarn/yarn.types";
import { INITIAL_YARNS } from "@/data/yarn";

export const YARNS_STORAGE_KEY = "auo-admin-yarns-v1";

function isYarnList(value: unknown): value is Yarn[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        "id" in item &&
        typeof item.id === "number" &&
        Number.isInteger(item.id) &&
        "code" in item &&
        typeof item.code === "string" &&
        "name" in item &&
        typeof item.name === "string" &&
        "type" in item &&
        typeof item.type === "string" &&
        "patternIds" in item &&
        Array.isArray(item.patternIds) &&
        item.patternIds.every(
          (patternId: unknown) => typeof patternId === "string",
        ) &&
        "description" in item &&
        typeof item.description === "string",
    )
  );
}

export function useYarns() {
  const [yarns, setYarns] = useState(INITIAL_YARNS);
  const [storageReady, setStorageReady] = useState(false);
  const canWriteStorage = useRef(true);

  useEffect(() => {
    try {
      const storedYarns = window.localStorage.getItem(YARNS_STORAGE_KEY);
      if (storedYarns !== null) {
        const parsedYarns: unknown = JSON.parse(storedYarns);
        if (!isYarnList(parsedYarns)) {
          throw new Error("Dữ liệu chất liệu đã lưu không hợp lệ.");
        }
        queueMicrotask(() => {
          setYarns(parsedYarns);
          setStorageReady(true);
        });
      } else {
        queueMicrotask(() => setStorageReady(true));
      }
    } catch (error) {
      console.error("Không thể tải danh sách chất liệu.", error);
      showToast("error", "Không thể tải danh sách chất liệu đã lưu.");
    }
  }, []);

  useEffect(() => {
    if (!storageReady || !canWriteStorage.current) return;

    try {
      window.localStorage.setItem(YARNS_STORAGE_KEY, JSON.stringify(yarns));
    } catch (error) {
      console.error("Không thể lưu danh sách chất liệu.", error);
      showToast("error", "Không thể lưu danh sách chất liệu.");
      canWriteStorage.current = false;
    }
  }, [storageReady, yarns]);

  return { yarns, setYarns };
}
