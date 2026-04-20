import { openDB, type IDBPDatabase } from "idb";
import type { Load, RouteRate } from "@/types";

/* IndexedDB layer for offline support.
 * Stores: loads, my_loads, saved_loads, rate_cache, draft_load, post_queue, meta */

const DB_NAME = "zimfreight-offline";
const DB_VERSION = 1;

export interface DraftRecord { id: "current"; values: unknown; savedAt: number }
export interface QueuedPost { id: string; payload: Record<string, unknown>; queuedAt: number }
export interface MetaRecord { key: string; value: number | string }

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("loads")) db.createObjectStore("loads", { keyPath: "id" });
        if (!db.objectStoreNames.contains("my_loads")) db.createObjectStore("my_loads", { keyPath: "id" });
        if (!db.objectStoreNames.contains("saved_loads")) db.createObjectStore("saved_loads", { keyPath: "id" });
        if (!db.objectStoreNames.contains("rate_cache")) db.createObjectStore("rate_cache", { keyPath: "key" });
        if (!db.objectStoreNames.contains("draft_load")) db.createObjectStore("draft_load", { keyPath: "id" });
        if (!db.objectStoreNames.contains("post_queue")) db.createObjectStore("post_queue", { keyPath: "id" });
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

/* Generic helpers (no-op when SSR / no IndexedDB) */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

/* ----- Loads cache ----- */
export async function cacheLoads(list: Load[]) {
  const db = await getDb();
  if (!db) return;
  await safe(async () => {
    const tx = db.transaction("loads", "readwrite");
    await tx.objectStore("loads").clear();
    for (const l of list.slice(0, 100)) await tx.objectStore("loads").put(l);
    await tx.done;
    await setMeta("loads_updated_at", Date.now());
  }, undefined);
}

export async function getCachedLoads(): Promise<Load[]> {
  const db = await getDb();
  if (!db) return [];
  return safe(async () => (await db.getAll("loads")) as Load[], []);
}

/* ----- Rate cache ----- */
export async function cacheRate(origin: string, destination: string, rate: RouteRate | null) {
  if (!rate) return;
  const db = await getDb();
  if (!db) return;
  await safe(async () => {
    await db.put("rate_cache", { key: `${origin}|${destination}`, rate, cachedAt: Date.now() });
  }, undefined);
}

export async function getCachedRate(origin: string, destination: string): Promise<{ rate: RouteRate; cachedAt: number } | null> {
  const db = await getDb();
  if (!db) return null;
  return safe(async () => (await db.get("rate_cache", `${origin}|${destination}`)) ?? null, null);
}

/* ----- Draft load ----- */
export async function saveDraft(values: unknown) {
  const db = await getDb();
  if (!db) return;
  await safe(async () => {
    await db.put("draft_load", { id: "current", values, savedAt: Date.now() } satisfies DraftRecord);
  }, undefined);
}

export async function loadDraft(): Promise<DraftRecord | null> {
  const db = await getDb();
  if (!db) return null;
  return safe(async () => (await db.get("draft_load", "current")) ?? null, null);
}

export async function clearDraft() {
  const db = await getDb();
  if (!db) return;
  await safe(async () => { await db.delete("draft_load", "current"); }, undefined);
}

/* ----- Post queue ----- */
export async function enqueuePost(payload: Record<string, unknown>): Promise<QueuedPost> {
  const db = await getDb();
  const rec: QueuedPost = { id: crypto.randomUUID(), payload, queuedAt: Date.now() };
  if (!db) return rec;
  await safe(async () => { await db.put("post_queue", rec); }, undefined);
  return rec;
}

export async function listQueuedPosts(): Promise<QueuedPost[]> {
  const db = await getDb();
  if (!db) return [];
  return safe(async () => (await db.getAll("post_queue")) as QueuedPost[], []);
}

export async function removeQueuedPost(id: string) {
  const db = await getDb();
  if (!db) return;
  await safe(async () => { await db.delete("post_queue", id); }, undefined);
}

/* ----- Meta ----- */
export async function setMeta(key: string, value: number | string) {
  const db = await getDb();
  if (!db) return;
  await safe(async () => { await db.put("meta", { key, value } satisfies MetaRecord); }, undefined);
}

export async function getMeta(key: string): Promise<number | string | null> {
  const db = await getDb();
  if (!db) return null;
  return safe(async () => {
    const rec = (await db.get("meta", key)) as MetaRecord | undefined;
    return rec?.value ?? null;
  }, null);
}