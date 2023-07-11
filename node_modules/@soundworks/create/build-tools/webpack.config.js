// import { merge } from 'webpack-merge';

// You can extend / override the default webpack config provided by @soundworks/build
// to match you own needs using this function.
// Be aware that the changes made here will only apply to client-side browsers bundles,
// not on server-side or node clients files which are only processed through babel.
// If you want to extends the babel configuration for these files, see babel.config.js
export default (config) => {
  // config.module.rules[0].use.options.plugins.push('@babel/plugin-transform-arrow-functions')
  // do something with the default config
  return config;
};
