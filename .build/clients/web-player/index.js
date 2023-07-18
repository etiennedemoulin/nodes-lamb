import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';
import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';
import { html } from 'lit';
import createLayout from './layout.js';
import '../components/sw-player.js';
import Engine from '../components/engine.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

/**
 * Grab the configuration object written by the server in the `index.html`
 */
const config = window.SOUNDWORKS_CONFIG;
const audioContext = new AudioContext();

/**
 * If multiple clients are emulated you might to want to share some resources
 */
// const audioContext = new AudioContext();

async function main($container) {
  /**
   * Create the soundworks client
   */
  const client = new Client(config);
  client.pluginManager.register('platform-init', pluginPlatformInit, {
    audioContext
  });
  launcher.register(client, {
    initScreensContainer: $container
  });

  /**
   * Launch application
   */
  // console.log(`> before start - audioContext is "${audioContext.state}"`);
  await client.start();
  // console.log(`> after start - audioContext is "${audioContext.state}"`);

  const $layout = createLayout(client, $container);

  // const globals = await client.stateManager.attach('globals');
  const player = await client.stateManager.create('player', {
    id: client.id
  });
  const engine = new Engine(audioContext, player, true);
  engine.connect(audioContext.destination);
  player.onUpdate(() => {
    $layout.requestUpdate();
    engine.render();
  });
  $layout.addComponent(html`<sw-player .player=${player}></sc-player>`);
}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1
});
//# sourceMappingURL=./index.js.map