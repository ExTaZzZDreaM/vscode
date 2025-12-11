/*---------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 100;

import gulp from 'gulp';
import * as path from 'path';
import es from 'event-stream';
import filter from 'gulp-filter';
import * as util from './lib/util.ts';
import { getVersion } from './lib/getVersion.ts';
import * as task from './lib/task.ts';
import watcher from './lib/watch/index.ts';
import { createReporter } from './lib/reporter.ts';
import glob from 'glob';
import plumber from 'gulp-plumber';
import * as ext from './lib/extensions.ts';
import * as tsb from './lib/tsb/index.ts';
import sourcemaps from 'gulp-sourcemaps';
import * as nodeUtil from 'util';

const root = path.dirname(import.meta.dirname);
const commit = getVersion(root);

const compilations = [
	'extensions/configuration-editing/tsconfig.json',
	'extensions/css-language-features/client/tsconfig.json',
	'extensions/css-language-features/server/tsconfig.json',
	'extensions/debug-auto-launch/tsconfig.json',
	'extensions/debug-server-ready/tsconfig.json',
	'extensions/emmet/tsconfig.json',
	'extensions/extension-editing/tsconfig.json',
	'extensions/git/tsconfig.json',
	'extensions/git-base/tsconfig.json',
	'extensions/grunt/tsconfig.json',
	'extensions/gulp/tsconfig.json',
	'extensions/html-language-features/client/tsconfig.json',
	'extensions/html-language-features/server/tsconfig.json',
	'extensions/jake/tsconfig.json',
	'extensions/json-language-features/client/tsconfig.json',
	'extensions/json-language-features/server/tsconfig.json',
	'extensions/markdown-language-features/tsconfig.json',
	'extensions/media-preview/tsconfig.json',
	'extensions/merge-conflict/tsconfig.json',
	'extensions/terminal-suggest/tsconfig.json',
	'extensions/npm/tsconfig.json',
	'extensions/php-language-features/tsconfig.json',
	'extensions/references-view/tsconfig.json',
	'extensions/search-result/tsconfig.json',
	'extensions/simple-browser/tsconfig.json',
	'extensions/tunnel-forwarding/tsconfig.json',
	'extensions/typescript-language-features/web/tsconfig.json',
	'extensions/typescript-language-features/tsconfig.json',
];

const getBaseUrl = (out: string) => `https://main.vscode-cdn.net/sourcemaps/${commit}/${out}`;

const tasks = compilations.map(function (tsconfigFile) {
	const absolutePath = path.join(root, tsconfigFile);
	const relativeDirname = path.dirname(tsconfigFile.replace(/^(.*\/)?extensions\//i, ''));

	const overrideOptions: { sourceMap?: boolean; inlineSources?: boolean; base?: string } = {};
	overrideOptions.sourceMap = true;

	const name = relativeDirname.replace(/\//g, '-');

	const srcRoot = path.dirname(tsconfigFile);
	const srcBase = path.join(srcRoot, 'src');
	const src = path.join(srcBase, '**');
	const srcOpts = { cwd: root, base: srcBase, dot: true };

	const out = path.join(srcRoot, 'out');
	const baseUrl = getBaseUrl(out);

	function createPipeline(build: boolean, emitError?: boolean, transpileOnly?: boolean) {
		const reporter = createReporter('extensions');

		overrideOptions.inlineSources = Boolean(build);
		overrideOptions.base = path.dirname(absolutePath);

		const compilation = tsb.create(absolutePath, overrideOptions, { verbose: false, transpileOnly, transpileOnlyIncludesDts: transpileOnly,
