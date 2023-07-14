import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';
import { loadConfig } from '../../utils/load-config.js';
import createLayout from './layout.js';
import { AudioContext, GainNode, OscillatorNode, mediaDevices, MediaStreamAudioSourceNode, AnalyserNode } from 'node-web-audio-api';
import Engine from '../components/engine.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function bootstrap() {
  /**
   * Load configuration from config files and create the soundworks client
   */
  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);

  /**
   * Register the soundworks client into the launcher
   *
   * Automatically restarts the process when the socket closes or when an
   * uncaught error occurs in the program.
   */
  launcher.register(client);

  /**
   * Launch application
   */
  await client.start();
  const player = await client.stateManager.create('player', {
    id: client.id
  });

  // create application layout (which mimics the client-side API)
  const $layout = createLayout(client);
  const audioContext = new AudioContext();
  audioContext.destination.channelCount = 32;
  await audioContext.resume();
  const merger = audioContext.createChannelMerger(10); // 8 in, 1 out

  for (let i = 0; i < 10; i++) {
    const engine = new Engine(audioContext, player);
    engine.env.connect(merger, 0, i);
    player.onUpdate(() => {
      $layout.requestUpdate();
      engine.render();
    });
  }
  merger.connect(audioContext.destination);

  // engine.env.connect(merger, 0, 9); // out (in source) , inputs (in dest)
  // // source.connect(dest);
  // console.log(audioContext.destination);
  // merger.connect(audioContext.destination);
}

// The launcher allows to fork multiple clients in the same terminal window
// by defining the `EMULATE` env process variable
// e.g. `EMULATE=10 npm run watch-process thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url
});
//# sourceMappingURL=./index.js.map