const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-api';
const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const PUBLIC_SITE_KEY = import.meta.env?.VITE_TURNSTILE_SITE_KEY || '';

let scriptPromise = null;
const widgets = new Map();
let cleanupObserver = null;

function getTurnstileApi() {
  return globalThis.window?.turnstile;
}

function loadScript() {
  const existingApi = getTurnstileApi();
  if (existingApi?.render) return Promise.resolve(existingApi);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.getElementById(TURNSTILE_SCRIPT_ID)
      || document.createElement('script');
    const isNewScript = !script.id;

    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;

    const handleLoad = () => {
      script.removeEventListener?.('load', handleLoad);
      script.removeEventListener?.('error', handleError);
      const api = getTurnstileApi();
      if (!api?.render) {
        script.remove?.();
        reject(new Error('Cloudflare Turnstile did not initialize.'));
        return;
      }
      resolve(api);
    };

    const handleError = () => {
      script.removeEventListener?.('load', handleLoad);
      script.removeEventListener?.('error', handleError);
      if (isNewScript) script.remove?.();
      reject(new Error('Cloudflare Turnstile could not be loaded.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    if (isNewScript) document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

function observeDetachedWidgets() {
  if (cleanupObserver || typeof MutationObserver === 'undefined') return;

  cleanupObserver = new MutationObserver(() => {
    for (const [widgetId, widget] of widgets) {
      if (!widget.container.isConnected) TurnstileService.cleanup(widgetId);
    }
  });
  cleanupObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

export const TurnstileService = {
  async render({
    container,
    action,
    onToken = () => {},
    onExpired = () => {},
    onError = () => {},
    siteKey = PUBLIC_SITE_KEY,
  } = {}) {
    if (!container || typeof container !== 'object') {
      throw new TypeError('A Turnstile widget container is required.');
    }
    if (typeof action !== 'string' || !action) {
      throw new TypeError('A Turnstile action is required.');
    }
    if (typeof siteKey !== 'string' || !siteKey.trim()) {
      throw new Error('The public Turnstile site key is not configured.');
    }

    const api = await loadScript();
    let token = '';
    let widgetId;
    const width = container.clientWidth || 0;

    widgetId = api.render(container, {
      sitekey: siteKey.trim(),
      action,
      size: width > 0 && width < 300 ? 'compact' : 'normal',
      callback: (value) => {
        token = value;
        onToken(value);
      },
      'expired-callback': () => {
        token = '';
        api.reset(widgetId);
        onExpired();
      },
      'error-callback': () => {
        token = '';
        api.reset(widgetId);
        onError();
      },
    });

    const widget = {
      id: widgetId,
      container,
      getToken() {
        return token;
      },
      reset() {
        token = '';
        api.reset(widgetId);
      },
      cleanup() {
        TurnstileService.cleanup(widgetId);
      },
    };

    widgets.set(widgetId, { ...widget, api });
    observeDetachedWidgets();
    return widget;
  },

  reset(widgetId) {
    const widget = widgets.get(widgetId);
    if (!widget) return false;
    widget.reset();
    return true;
  },

  cleanup(widgetId) {
    const widget = widgets.get(widgetId);
    if (!widget) return false;
    widgets.delete(widgetId);
    widget.api.remove(widgetId);
    if (widgets.size === 0) {
      cleanupObserver?.disconnect();
      cleanupObserver = null;
    }
    return true;
  },

  cleanupAll() {
    for (const widgetId of [...widgets.keys()]) {
      this.cleanup(widgetId);
    }
  },
};
