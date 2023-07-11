import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';
import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';
import { html } from 'lit';
import createLayout from './layout.js';
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-number.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-select.js';
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

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);

  /**
   * Register the soundworks client into the launcher
   *
   * The launcher will do a bunch of stuff for you:
   * - Display default initialization screens. If you want to change the provided
   * initialization screens, you can import all the helpers directly in your
   * application by doing `npx soundworks --eject-helpers`. You can also
   * customise some global syles variables (background-color, text color etc.)
   * in `src/clients/components/css/app.scss`.
   * You can also change the default language of the intialization screen by
   * setting, the `launcher.language` property, e.g.:
   * `launcher.language = 'fr'`
   * - By default the launcher automatically reloads the client when the socket
   * closes or when the page is hidden. Such behavior can be quite important in
   * performance situation where you don't want some phone getting stuck making
   * noise without having any way left to stop it... Also be aware that a page
   * in a background tab will have all its timers (setTimeout, etc.) put in very
   * low priority, messing any scheduled events.
   */
  launcher.register(client, {
    initScreensContainer: $container
  });

  /**
   * Launch application
   */
  await client.start();

  // The `$layout` is provided as a convenience and is not required by soundworks,
  // its full source code is located in the `./views/layout.js` file, so feel free
  // to edit it to match your needs or even to delete it.
  const $layout = createLayout(client, $container);
  const globals = await client.stateManager.attach('globals');
  const player = await client.stateManager.create('player', {
    id: client.id
  });
  const engine = new Engine(audioContext, player);
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