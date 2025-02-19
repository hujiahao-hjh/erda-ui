#!/usr/bin/env node
// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import path from 'path';
import { Command } from 'commander';
import inquirer from 'inquirer';

const program = new Command();

inquirer.registerPrompt('directory', require('inquirer-select-directory'));

program
  .version(`erda-ui/cli ${require('../../package').version}`)
  .usage('<command> [options]');

// program
//   .command('setup [env]')
//   .description('run setup commands for all envs')
//   .option('-s, --setup_mode <mode>', 'Which setup mode to use', 'normal')
//   .action((env, options) => {
//     env = env || 'all';
//     console.log('read config from %s', program.opts().config);
//     console.log('setup for %s env(s) with %s mode', env, options.setup_mode);
//   });

program
  .command('setup <module> <port>')
  .description('setup env and tsconfig for module')
  .action((moduleName, port) => {
    require('../lib/setup')(moduleName, port);
  });

program
  .command('build')
  .description('bundle files to public directory, pass true to launch a local full compilation build, pass image sha to launch a local partial compilation build based on image')
  .option('-i, --image <image>', 'image sha as build base, e.g. 1.0-20210506-48bd74')
  .option('-l, --local', 'enable local mode, if image arg is given, then local mode is forcibly')
  .action((options) => {
    require('../lib/build')(options);
  });

program
  .command('copy <module>')
  .option('-p, --dist_path <dist>', 'Dist directory path', './dist')
  .description('copy module build files to erda-ui public directory')
  .action((module, options) => {
    require('../lib/copy')(module, options);
  });

program
  .command('release')
  .description('build & push docker image')
  .option('-i, --image <image>', 'image sha as build base, e.g. 1.0-20210506-48bd74')
  .action((options) => {
    require('../lib/release')(options);
  });

program
  .command('i18n [workDir]')
  .description('translate words in work dir')
  .action((_workDir) => {
    const workDir = _workDir
      ? path.resolve(process.cwd(), _workDir)
      : process.cwd();
    require('../lib/i18n')({ workDir });
  });

program
  .command('add-license')
  .option('-t, --fileType <file_type>', 'File type', 'js,ts,jsx,tsx')
  .description('add license header in files if not exist')
  .action(({ fileType }) => {
    require('../lib/add-license')({ fileType });
  });

program
  .command('check-license')
  .option('-t, --fileType <file_type>', 'File type', 'js,ts,jsx,tsx')
  .option('-d, --directory <directory>', 'work directory')
  .description('check license header in files')
  .action(({ fileType, directory }) => {
    require('../lib/check-license')({ fileType, directory });
  });

program
  .command('launch')
  .description('launch erda ui in development mode')
  .action(() => {
    require('../lib/launcher')();
  });


program.parse(process.argv);
