import test from 'node:test';
import assert from 'node:assert/strict';

function createEnvironment({ loadFailure = false } = {}) {
  const scripts = new Map();
  const rendered = [];
  const resetIds = [];
  const removedIds = [];
  let scriptLoads = 0;

  const turnstile = {
    render(container, options) {
      const id = `widget-${rendered.length + 1}`;
      rendered.push({ id, container, options });
      return id;
    },
    reset(id) {
      resetIds.push(id);
    },
    remove(id) {
      removedIds.push(id);
    },
  };

  const window = {};
  const document = {
    documentElement: {},
    head: {
      appendChild(script) {
        scriptLoads += 1;
        scripts.set(script.id, script);
        queueMicrotask(() => {
          if (loadFailure) {
            script.dispatch('error');
          } else {
            window.turnstile = turnstile;
            script.dispatch('load');
          }
        });
      },
    },
    getElementById(id) {
      return scripts.get(id) || null;
    },
    createElement() {
      const listeners = new Map();
      return {
        id: '',
        addEventListener(name, callback) {
          listeners.set(name, callback);
        },
        removeEventListener(name) {
          listeners.delete(name);
        },
        dispatch(name) {
          listeners.get(name)?.();
        },
        remove() {
          scripts.delete(this.id);
        },
      };
    },
  };

  class FakeMutationObserver {
    observe() {}
    disconnect() {}
  }

  const previousGlobals = {
    window: globalThis.window,
    document: globalThis.document,
    MutationObserver: globalThis.MutationObserver,
  };
  globalThis.window = window;
  globalThis.document = document;
  globalThis.MutationObserver = FakeMutationObserver;

  return {
    rendered,
    resetIds,
    removedIds,
    get scriptLoads() {
      return scriptLoads;
    },
    restore() {
      globalThis.window = previousGlobals.window;
      globalThis.document = previousGlobals.document;
      globalThis.MutationObserver = previousGlobals.MutationObserver;
    },
  };
}

test('Turnstile script is loaded once and widget instances keep independent tokens', async () => {
  const environment = createEnvironment();
  const { TurnstileService } = await import('../src/data/TurnstileService.js?multiple-widgets');
  try {
    const firstContainer = { clientWidth: 250, isConnected: true };
    const secondContainer = { clientWidth: 320, isConnected: true };
    const [first, second] = await Promise.all([
      TurnstileService.render({
        container: firstContainer,
        action: 'contact_enquiry',
        siteKey: 'public-test-site-key',
      }),
      TurnstileService.render({
        container: secondContainer,
        action: 'careers_application',
        siteKey: 'public-test-site-key',
      }),
    ]);

    assert.equal(environment.scriptLoads, 1);
    assert.equal(environment.rendered.length, 2);
    assert.equal(environment.rendered[0].options.size, 'compact');
    assert.equal(environment.rendered[1].options.size, 'normal');
    assert.equal(environment.rendered[0].options.action, 'contact_enquiry');
    assert.equal(environment.rendered[1].options.action, 'careers_application');

    environment.rendered[0].options.callback('first-token');
    environment.rendered[1].options.callback('second-token');
    assert.equal(first.getToken(), 'first-token');
    assert.equal(second.getToken(), 'second-token');

    first.reset();
    assert.deepEqual(environment.resetIds, ['widget-1']);
    assert.equal(first.getToken(), '');
    assert.equal(second.getToken(), 'second-token');
    assert.equal(TurnstileService.reset(first.id), true);
    assert.deepEqual(environment.resetIds, ['widget-1', 'widget-1']);

    environment.rendered[1].options['expired-callback']();
    assert.equal(second.getToken(), '');
    assert.deepEqual(environment.resetIds, ['widget-1', 'widget-1', 'widget-2']);
    assert.equal(TurnstileService.cleanup('widget-1'), true);
    assert.deepEqual(environment.removedIds, ['widget-1']);
    second.cleanup();
    assert.deepEqual(environment.removedIds, ['widget-1', 'widget-2']);
  } finally {
    TurnstileService.cleanupAll();
    environment.restore();
  }
});

test('Turnstile script failures reject rendering instead of bypassing verification', async () => {
  const environment = createEnvironment({ loadFailure: true });
  const { TurnstileService } = await import('../src/data/TurnstileService.js?load-failure');
  try {
    await assert.rejects(
      TurnstileService.render({
        container: { clientWidth: 300, isConnected: true },
        action: 'contact_enquiry',
        siteKey: 'public-test-site-key',
      }),
      /could not be loaded/
    );
    assert.equal(environment.rendered.length, 0);
    assert.equal(environment.scriptLoads, 1);
  } finally {
    TurnstileService.cleanupAll();
    environment.restore();
  }
});

test('Turnstile rendering fails closed when the public site key is absent', async () => {
  const environment = createEnvironment();
  const { TurnstileService } = await import('../src/data/TurnstileService.js?missing-site-key');
  try {
    await assert.rejects(
      TurnstileService.render({
        container: { clientWidth: 300, isConnected: true },
        action: 'contact_enquiry',
        siteKey: '',
      }),
      /site key is not configured/
    );
    assert.equal(environment.scriptLoads, 0);
  } finally {
    environment.restore();
  }
});
