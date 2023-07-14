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
  const players = await client.stateManager.getCollection('player');
  const audioContext = new AudioContext();
  audioContext.destination.channelCount = 11;
  audioContext.destination.channelCountMode = "explicit";
  audioContext.destination.channelInterpretation = "discrete";
  await audioContext.resume();
  const merger = audioContext.createChannelMerger(11); // 11 in, 1 out
  merger.connect(audioContext.destination);
  const chArray = [0, 1, 2, 3, 9, 10, 6, 7]; // slots
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
}

// The launcher allows to fork multiple clients in the same terminal window
// by defining the `EMULATE` env process variable
// e.g. `EMULATE=10 npm run watch-process thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url
});
//# sourceMappingURL=./index.js.map