import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { loadConfig } from '../../utils/load-config.js';

import { AudioContext } from 'node-web-audio-api';

import Engine from '../components/engine.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const env = 'dev';

async function bootstrap() {
  // for dev
  let config;
  if (env === 'dev') {
    config = loadConfig('default', import.meta.url);
  } else {
    config = loadConfig('remote', import.meta.url);
  }
  // for prod
  const client = new Client(config);

  launcher.register(client);

  /**
   * Launch application
   */
  await client.start();

  const players = await client.stateManager.getCollection('player');
  const globals = await client.stateManager.attach('globals');

  const audioContext = new AudioContext();
  const numChannels = 16;
  console.log('> Num Channels:', numChannels);

  audioContext.destination.channelCount = numChannels;
  audioContext.destination.channelInterpretation = 'discrete';

  await audioContext.resume();

  const merger = audioContext.createChannelMerger(numChannels);

  merger.channelInterpretation = 'discrete';
  merger.connect(audioContext.destination);

  const engines = Array(numChannels).fill(null);
  const logger = Array(numChannels).fill(null);

  players.onAttach((player) => {
    // push engine in first free slot
    for (let i = 0; i < engines.length; i++) {
      if (engines[i] === null) {
        const engine = new Engine(audioContext, player, globals, false);
        engines[i] = engine;
        logger[i] = player;
        engine.connect(merger, 0, i);
        player.onUpdate(() => {
          engine.render();
        })
        break;
      }
    }
    render(logger);
  });

  players.onDetach((player) => {
    for (let i = 0; i < engines.length; i++) {
      if (engines[i]
        && player.get('id') === engines[i].getEngineId())
      {
        // console.log(`removing engine ${player.get('id')}`)
        engines[i].disconnect();
        engines[i] = null;
        logger[i] = null;
      }
    }
    render(logger);
  });

  players.onUpdate((player, newValues) => {
    render(logger);
  })
}

// The launcher allows to fork multiple clients in the same terminal window
// by defining the `EMULATE` env process variable
// e.g. `EMULATE=10 npm run watch-process thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});


function render(logger) {
  const table = [];
  logger.forEach((player, index) => {
    if (player) {
      table.push({index: index+1, freq: player.get('sawFreq'), id: player.get('id'), filter: player.get('filterFreq')});
    } else {
      table.push({index: index+1, freq: null, id: null, filter: null});
    }
  })
  console.clear();
  if (env === 'dev') {
    console.log('playing in dev environment');
  } else {
    console.log('playing in prod environment');
  }
  console.table(table);
}
