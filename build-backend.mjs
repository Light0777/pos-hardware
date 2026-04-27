import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: ['server/src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'server/dist/index.cjs',
  external: ['better-sqlite3'],
  plugins: [{
    name: 'resolve-ts-extensions',
    setup(build) {
      build.onResolve({ filter: /\.js$/ }, args => {
        if (args.importer.includes('node_modules')) return null;
        const tsPath = path.resolve(
          path.dirname(args.importer),
          args.path.replace(/\.js$/, '.ts')
        );
        if (fs.existsSync(tsPath)) {
          return { path: tsPath };
        }
        return null;
      });
    }
  }]
});

console.log('Backend build complete!');
