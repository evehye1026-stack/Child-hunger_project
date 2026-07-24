"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "childAge";
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): number | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? Number(stored) : null;
}

function getServerSnapshot(): number | null {
  return null;
}

export function useChildAge() {
  const age = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setAge(value: number) {
    window.localStorage.setItem(STORAGE_KEY, String(value));
    emitChange();
  }

  function clearAge() {
    window.localStorage.removeItem(STORAGE_KEY);
    emitChange();
  }

  return { age, setAge, clearAge };
}
