/* IndexedDB storage with localStorage fallback and legacy migration. */
(function (root) {
  'use strict';

  const DB_NAME = 'plotter-fvs-pwa';
  const DB_VERSION = 1;
  const STORE_NAME = 'keyvalue';
  const STATE_KEY = 'fvs_appdata';
  let databasePromise = null;
  let activeBackend = 'indexeddb';

  function openDatabase() {
    if (!('indexedDB' in root)) return Promise.reject(new Error('IndexedDB is unavailable.'));
    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
      const request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Could not open IndexedDB.'));
      request.onblocked = () => reject(new Error('IndexedDB upgrade was blocked.'));
    });

    databasePromise.catch(() => {
      databasePromise = null;
    });
    return databasePromise;
  }

  async function idbGet(key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB read failed.'));
    });
  }

  async function idbSet(key, value) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB write failed.'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB write was aborted.'));
    });
  }

  function localGet() {
    try {
      const raw = root.localStorage.getItem(STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function localSet(value) {
    root.localStorage.setItem(STATE_KEY, JSON.stringify(value));
  }

  async function loadState() {
    try {
      const stored = await idbGet(STATE_KEY);
      activeBackend = 'indexeddb';
      if (stored !== undefined && stored !== null) return stored;

      const legacy = localGet();
      if (legacy) {
        await idbSet(STATE_KEY, legacy);
        try { root.localStorage.setItem(`${STATE_KEY}_migrated`, '1'); } catch (error) { /* no-op */ }
        return legacy;
      }
      return null;
    } catch (error) {
      console.warn('IndexedDB unavailable; using localStorage.', error);
      activeBackend = 'localstorage';
      return localGet();
    }
  }

  async function saveState(value) {
    try {
      await idbSet(STATE_KEY, value);
      activeBackend = 'indexeddb';
      return activeBackend;
    } catch (error) {
      console.warn('IndexedDB save failed; using localStorage.', error);
      activeBackend = 'localstorage';
      localSet(value);
      return activeBackend;
    }
  }

  async function requestPersistence() {
    try {
      if (!root.navigator?.storage?.persist) return false;
      if (await root.navigator.storage.persisted()) return true;
      return await root.navigator.storage.persist();
    } catch (error) {
      return false;
    }
  }

  async function estimate() {
    try {
      if (!root.navigator?.storage?.estimate) return null;
      return await root.navigator.storage.estimate();
    } catch (error) {
      return null;
    }
  }

  root.AppStorage = Object.freeze({
    loadState,
    saveState,
    requestPersistence,
    estimate,
    get backend() { return activeBackend; }
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
