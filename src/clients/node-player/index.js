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
  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);

  launcher.register(client);

  /**
   * Launch application
   */
  await client.start();

  const players = await client.stateManager.getCollection('player');

  const audioContext = new AudioContext();
  const numChannels = 16;

  audioContext.destination.channelCount = numChannels;
  audioContext.destination.channelInterpretation = 'discrete';

  await audioContext.resume();

  const merger = audioContext.createChannelMerger(numChannels);

  merger.channelInterpretation = 'discrete';
  merger.connect(audioContext.destination);

  const engines = Array(numChannels).fill(null);

  players.onAttach((player) => {
    // push engine in first free slot
    for (let i = 0; i < engines.length; i++) {
      if (engines[i] === null) {
        const engine = new Engine(audioContext, player, false);
        engines[i] = engine;
        engine.connect(merger, 0, i);
        player.onUpdate(() => {
          engine.render();
        })
        break;
      }
    }
  });

  players.onDetach((player) => {
    for (let i = 0; i < engines.length; i++) {
      if (engines[i]
        && player.get('id') === engines[i].getEngineId())
      {
        // console.log(`removing engine ${player.get('id')}`)
        engines[i].disconnect();
        engines[i] = null;
      }
    }
  })
}

// The launcher allows to fork multiple clients in the same terminal window
// by defining the `EMULATE` env process variable
// e.g. `EMULATE=10 npm run watch-process thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
