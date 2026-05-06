/**
 * PWA Utilities
 * Service worker registration and PWA features
 */

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[PWA] New service worker found');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New version available');
            // Show update notification
            showUpdateNotification();
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('[PWA] Service workers not supported');
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('[PWA] Service worker unregistered');
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

/**
 * Show install prompt
 */
let deferredPrompt = null;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Install prompt available');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    deferredPrompt = null;
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

/**
 * Show install prompt to user
 */
export async function showInstallPrompt() {
  if (!deferredPrompt) {
    console.warn('[PWA] Install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log('[PWA] Install prompt outcome:', outcome);
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

/**
 * Check if install prompt is available
 */
export function isInstallPromptAvailable() {
  return deferredPrompt !== null;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[PWA] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show notification
 */
export async function showNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('[PWA] Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[PWA] Notification permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    ...options,
  });
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush() {
  if (!('PushManager' in window)) {
    console.warn('[PWA] Push notifications not supported');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    console.log('[PWA] Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    console.log('[PWA] Push unsubscribed');
  }
}

/**
 * Check if online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Setup online/offline listeners
 */
export function setupOnlineListeners(onOnline, onOffline) {
  window.addEventListener('online', () => {
    console.log('[PWA] Online');
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Offline');
    onOffline?.();
  });
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }
}

/**
 * Update service worker
 */
export async function updateServiceWorker() {
  const registration = await navigator.serviceWorker.ready;
  
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

/**
 * Get app info
 */
export function getAppInfo() {
  return {
    isInstalled: isAppInstalled(),
    isOnline: isOnline(),
    hasServiceWorker: 'serviceWorker' in navigator,
    hasNotifications: 'Notification' in window,
    hasPush: 'PushManager' in window,
    notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported',
  };
}
