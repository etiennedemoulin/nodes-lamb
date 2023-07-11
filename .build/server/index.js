import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig } from '../utils/load-config.js';
import '../utils/catch-unhandled-errors.js';
import { globalsSchema } from './schemas/globals.js';
import { playerSchema } from './schemas/player.js';
import pluginPlatformInit from '@soundworks/plugin-platform-init/server.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);
console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

/**
 * Create the soundworks server
 */
const server = new Server(config);
// configure the server for usage within this application template
server.useDefaultApplicationTemplate();
server.pluginManager.register('platform-init', pluginPlatformInit);
server.stateManager.registerSchema('globals', globalsSchema);
server.stateManager.registerSchema('player', playerSchema);
const globals = await server.stateManager.create('globals');
server.stateManager.registerUpdateHook('player', (updates, currentValues, context) => {
  if (updates.filterSlider) {
    const filterFreq = 1 + updates.filterSlider * currentValues.sawFreq * 7;
    const numHarm = Math.floor(filterFreq / currentValues.sawFreq);
    return {
      ...updates,
      filterFreq: filterFreq,
      numHarm: numHarm
    };
  } else {
    return {
      ...updates
    };
  }
});

/**
 * Register plugins and schemas
 */
// server.pluginManager.register('my-plugin', plugin);
// server.stateManager.registerSchema('my-schema', definition);

/**
 * Launch application (init plugins, http server, etc.)
 */
await server.start();

// and do your own stuff!
//# sourceMappingURL=./index.js.map