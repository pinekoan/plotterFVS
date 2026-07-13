/* PWA registration, install guidance, connection state, and save-state UI. */
(function (root) {
  'use strict';

  let installPrompt = null;
  let refreshing = false;
  let updateRequested = false;

  function element(id) {
    return document.getElementById(id);
  }

  function isStandalone() {
    return root.matchMedia?.('(display-mode: standalone)').matches || root.navigator.standalone === true;
  }

  function isIOS() {
    const userAgent = root.navigator.userAgent || '';
    const modernIPad = root.navigator.platform === 'MacIntel' && root.navigator.maxTouchPoints > 1;
    return /iphone|ipad|ipod/i.test(userAgent) || modernIPad;
  }

  function updateConnection() {
    const node = element('connectionStatus');
    if (!node) return;
    const online = root.navigator.onLine;
    node.textContent = online ? 'Online' : 'Offline-ready';
    node.className = `status-chip ${online ? 'online' : 'offline'}`;
  }

  function updateInstallButton() {
    const button = element('installButton');
    if (!button) return;
    if (isStandalone()) {
      button.hidden = true;
      return;
    }
    if (installPrompt) {
      button.hidden = false;
      button.textContent = 'Install app';
      return;
    }
    if (isIOS()) {
      button.hidden = false;
      button.textContent = 'Install instructions';
      return;
    }
    button.hidden = true;
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function showInstallInstructions() {
    const dialog = element('installDialog');
    if (!dialog) return;
    const body = element('installDialogBody');
    if (body) {
      body.innerHTML = isIOS()
        ? '<p>In Safari, tap the <strong>Share</strong> button, then choose <strong>Add to Home Screen</strong>. Open plOtter from the new home-screen icon once installation finishes.</p>'
        : '<p>Open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>';
    }
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  async function installApp() {
    if (!installPrompt) {
      showInstallInstructions();
      return;
    }
    installPrompt.prompt();
    try {
      await installPrompt.userChoice;
    } finally {
      installPrompt = null;
      updateInstallButton();
    }
  }

  function showUpdate(registration) {
    const button = element('updateButton');
    if (!button || !registration.waiting) return;
    button.hidden = false;
    button.onclick = () => {
      updateRequested = true;
      button.disabled = true;
      button.textContent = 'Updating…';
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    };
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in root.navigator)) return;
    try {
      const registration = await root.navigator.serviceWorker.register('./service-worker.js', { scope: './' });
      if (registration.waiting) showUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && root.navigator.serviceWorker.controller) {
            showUpdate(registration);
          }
        });
      });
      root.navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!updateRequested || refreshing) return;
        refreshing = true;
        root.location.reload();
      });
    } catch (error) {
      console.warn('Service worker registration failed.', error);
    }
  }

  function setSaveStatus(detail) {
    const node = element('saveStatus');
    if (!node) return;
    const status = typeof detail === 'string' ? detail : detail?.status;
    const backend = typeof detail === 'object' ? detail.backend : '';
    if (status === 'saving') {
      node.textContent = 'Saving…';
      node.className = 'status-chip saving';
    } else if (status === 'error') {
      node.textContent = 'Save failed';
      node.className = 'status-chip error';
    } else {
      node.textContent = backend === 'localstorage' ? 'Saved locally' : 'Saved on device';
      node.className = 'status-chip saved';
    }
  }

  root.addEventListener('online', updateConnection);
  root.addEventListener('offline', updateConnection);
  root.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    updateInstallButton();
  });
  root.addEventListener('appinstalled', () => {
    installPrompt = null;
    updateInstallButton();
  });
  root.addEventListener('plotter-save-status', (event) => setSaveStatus(event.detail));

  document.addEventListener('DOMContentLoaded', () => {
    updateConnection();
    updateInstallButton();
    element('installButton')?.addEventListener('click', installApp);
    element('installDialogClose')?.addEventListener('click', () => closeDialog(element('installDialog')));
    registerServiceWorker();

    const askForPersistence = async () => {
      document.removeEventListener('pointerdown', askForPersistence);
      document.removeEventListener('keydown', askForPersistence);
      await root.AppStorage?.requestPersistence?.();
    };
    document.addEventListener('pointerdown', askForPersistence, { once: true });
    document.addEventListener('keydown', askForPersistence, { once: true });
  });
})(window);
