import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import createLayout from './layout.js';


import { html, nothing } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import '../components/sw-player.js';
import '@ircam/sc-components/sc-button.js';
import '@ircam/sc-components/sc-slider.js';
import throttle from 'lodash/throttle.js'

// import { html } from 'lit';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = window.SOUNDWORKS_CONFIG;

async function main($container) {
  const client = new Client(config);

  launcher.register(client, {
    initScreensContainer: $container,
    reloadOnVisibilityChange: false,
  });

  await client.start();

  const $layout = createLayout(client, $container);

  // const globals = await client.stateManager.attach('globals');
  const players = await client.stateManager.getCollection('player');
  const globals = await client.stateManager.attach('globals');

  const updateVolume = throttle(function (volume) {
    globals.set({ volume: volume}, { source: 'web' });
  }, 50, { 'trailing' : true});

  // placeholder of the remote controlled player state instance
  let remoteControlledPlayer = null;
  // collection
  $layout.addComponent({
    render: () => {
      return html`
        <div>
        <h2>Global phones volume</h2>
        <sc-slider
          relative
          orientation="vertical"
          number-box="true"
          min="${globals.getSchema().volume.min}"
          max="${globals.getSchema().volume.max}"
          value=${globals.get('volume')}
          @input=${e => updateVolume(e.target.value)}
        ></sc-slider>
        </div>
        <div>
        <h2>Connected players</h2>
        ${players.map(player => {
          return html`
            <sc-button
              value=${player.get('id')}
              @input=${e => {
                remoteControlledPlayer = player;
                $layout.requestUpdate();
              }}
            ></sc-button>
          `;
        })}
        <h2>Remote controlled player</h2>
        <div style="width:260px; height:420px;">
        ${remoteControlledPlayer !== null
          ? keyed(
              remoteControlledPlayer.get('id'),
              html`<sw-player .player=${remoteControlledPlayer}></sw-player>`
            )
          : nothing
        }
      </div>
      </div>`;
    }
  });

  // if a player connects or disconnect, we want to update the view accordingly
  players.onAttach(() => $layout.requestUpdate());
  players.onDetach(player => {
    // if the player is deleted, we reset the view
    if (player === remoteControlledPlayer) {
      remoteControlledPlayer = null;
    }
    $layout.requestUpdate();
  });

  // ...
  // $layout.addComponent(html`<h1>ok</h1>`);

  // setTimeout(() => {
  //   console.log($layout.querySelector('h1'));
  // }, 100);
}

launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
  width: '50%',
});
