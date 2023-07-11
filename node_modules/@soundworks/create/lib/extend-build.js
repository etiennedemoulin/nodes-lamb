import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import chalk from 'chalk';
import prompts from 'prompts';

import { onCancel } from './utils.js';

export async function extendBuild(_appInfos) {
  const __dirname = url.fileURLToPath(new URL('..', import.meta.url));
  const distDir = process.cwd();

  console.log(chalk.yellow(`> extend default config`));

  const { confirm } = await prompts([
    {
      type: 'toggle',
      name: 'confirm',
      message: 'Confirm?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
  ], { onCancel });

  console.log('');

  if (confirm) {
    ['babel.config.js', 'webpack.config.js'].forEach(filename => {
      const src = path.join(__dirname, 'build-tools', filename);
      const dest = path.join(distDir, filename);

      if (!fs.existsSync(dest)) {
        console.log(chalk.green(`> creating ${filename}`));
        fs.copyFileSync(src, dest);
      } else {
        console.log(`- ${filename} already exists, aborting...`);
      }
    });
  } else {
    console.error(`> aborting...`);
  }

  console.log(``);
}
