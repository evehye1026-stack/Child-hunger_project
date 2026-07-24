"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "foodCart";
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function readIds(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  emitChange();
}

function getSnapshot(): string {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

export function useCart() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let cartIds: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    cartIds = Array.isArray(parsed) ? parsed : [];
  } catch {
    cartIds = [];
  }

  function addToCart(id: string) {
    const current = readIds();
    if (!current.includes(id)) {
      writeIds([...current, id]);
    }
  }

  function removeFromCart(id: string) {
    writeIds(readIds().filter((x) => x !== id));
  }

  function removeMany(ids: string[]) {
    const idSet = new Set(ids);
    writeIds(readIds().filter((x) => !idSet.has(x)));
  }

  function isInCart(id: string): boolean {
    return cartIds.includes(id);
  }

  return { cartIds, addToCart, removeFromCart, removeMany, isInCart };
}
