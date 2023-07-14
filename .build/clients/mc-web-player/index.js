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

  // const player = await client.stateManager.create('player', {
  //   id: client.id,
  // });

  const players = await client.stateManager.getCollection('player');

  // The `$layout` is provided as a convenience and is not required by soundworks,
  // its full source code is located in the `./views/layout.js` file, so feel free
  // to edit it to match your needs or even to delete it.
  const $layout = createLayout(client, $container);
  audioContext.destination.channelCount = 16;
  audioContext.destination.channelCountMode = "explicit";
  audioContext.destination.channelInterpretation = "discrete";
  await audioContext.resume();
  console.log(audioContext.destination);
  const merger = audioContext.createChannelMerger(16); // 8 in, 1 out

  const chArray = [0, 1, 4, 5, 2, 8, 9, 10]; // slots
  // 0 : left (1)
  // 1 : right (2)
  // 2 : centre (5)
  // 3 : rien
  // 4 : left surround (3)
  // 5 : right surround (4)
  // 6 : rien
  // 7 : rien
  // 8 : centre (6)
  // 9 : left wide (7)
  // 10 : right wide (8)
  const engines = Array(8).fill(null);
  players.onAttach(player => {
    // push engine in first free slot
    for (let i = 0; i < engines.length - 1; i++) {
      if (engines[i] === null) {
        // console.log(`creating engine ${player.get('id')} on slot ${chArray[i]}`)
        const engine = new Engine(audioContext, player, false);
        engines[i] = engine;
        engine.env.connect(merger, 0, chArray[i]);
        player.onUpdate(() => {
          $layout.requestUpdate();
          engine.render();
        });
        break;
      }
    }
  });
  players.onDetach(player => {
    for (let i = 0; i < engines.length - 1; i++) {
      if (engines[i] && player.get('id') === engines[i].getEngineId()) {
        // console.log(`removing engine ${player.get('id')}`)
        engines[i].env.disconnect();
        engines[i] = null;
      }
    }
  });
  merger.connect(audioContext.destination);

  // $layout.addComponent(html`<sw-player .player=${player}></sc-player>`);
}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1
});
//# sourceMappingURL=./index.js.map