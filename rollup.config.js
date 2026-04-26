import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'server/src/index.ts',
  output: {
    file: 'server/dist/index.cjs',
    format: 'cjs',
    sourcemap: false
  },
  external: ['better-sqlite3'],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    typescript({
      tsconfig: 'server/tsconfig.json',
      compilerOptions: {
        module: 'ESNext',
        target: 'ES2020'
      }
    })
  ]
};