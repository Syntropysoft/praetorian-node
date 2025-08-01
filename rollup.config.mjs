import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { dts } from 'rollup-plugin-dts';

const createConfig = (input, output, format = 'cjs') => ({
  input,
  output: {
    file: output,
    format,
    sourcemap: true,
  },
  external: [
    'commander',
    'inquirer',
    'chalk',
    'yaml',
    'ajv',
    'fs',
    'path',
    'os',
    'util',
    'events',
    'stream',
    'crypto',
    'url',
    'http',
    'https',
    'zlib',
    'querystring',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'domain',
    'module',
    'net',
    'readline',
    'repl',
    'string_decoder',
    'sys',
    'timers',
    'tls',
    'tty',
    'v8',
    'vm',
    'worker_threads'
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
    }),
  ],
});

const createDtsConfig = (input, output) => ({
  input,
  output: {
    file: output,
    format: 'es',
  },
  plugins: [dts()],
});

export default [
  // Main library
  createConfig('src/index.ts', 'dist/index.js', 'cjs'),
  createDtsConfig('src/index.ts', 'dist/index.d.ts'),
  
  // CLI
  createConfig('src/cli/cli.ts', 'dist/cli.js', 'cjs'),
  createDtsConfig('src/cli/cli.ts', 'dist/cli.d.ts'),
]; 