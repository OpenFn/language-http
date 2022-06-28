import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { build } from 'esbuild';
import url from 'url';
import { execaCommand } from 'execa';

const commonBuildOptions = {
  bundle: true,
  write: true,
  watch: false,
  format: 'esm',
  target: 'esnext',
  outdir: './dist',
  external: ['vm', 'https'],
  pure: ['console.log', 'console.time', 'console.timeEnd'],
  platform: 'node',
  minify: false,
  sourcemap: 'inline',
};

function absPath(path) {
  return url.fileURLToPath(new URL(path, import.meta.url));
}

function run(command) {
  return execaCommand(command, {
    preferLocal: true,
    shell: true,
    stdio: 'inherit',
    // reject: false
  });
}

/**
 * Bundle all type definitions by using the API Extractor from RushStack
 * @param filename the source d.ts to bundle
 * @param outfile the output bundled file
 */
function bundleTypeDefinitions(filename, outfile) {
  // we give the config in its raw form instead of a file
  const extractorConfig = ExtractorConfig.prepare({
    configObject: {
      projectFolder: absPath('.'),
      mainEntryPointFilePath: filename,
      bundledPackages: ['@openfn/language-common'],
      compiler: {
        tsconfigFilePath: 'tsconfig.bundle.json',
        // overrideTsconfig: {
        //   compilerOptions: {
        //     paths: {}, // bug with api extract + paths
        //   },
        // },
      },
      dtsRollup: {
        enabled: true,
        untrimmedFilePath: outfile,
      },
      tsdocMetadata: {
        enabled: false,
      },
    },
    packageJsonFullPath: absPath('./package.json'),
    configObjectFullPath: undefined,
  });

  // here we trigger the "command line" interface equivalent
  const extractorResult = Extractor.invoke(extractorConfig, {
    showVerboseMessages: true,
    localBuild: true,
  });

  // we exit the process immediately if there were errors
  if (extractorResult.succeeded === false) {
    throw new Error(`API Extractor completed with errors`);
  }
}

try {
  /**
   * Main Entrypoint
   */
  await build({
    ...commonBuildOptions,
    entryPoints: {
      index: './src/index.js',
    },
    outExtension: { '.js': '.cjs' },
    format: 'cjs',
  });

  await build({
    ...commonBuildOptions,
    entryPoints: {
      index: './src/index.js',
    },
    format: 'esm',
  });

  await run('tsc -p tsconfig.bundle.json');

  console.log('Bundling .d.ts');
  bundleTypeDefinitions('./dist/index.d.ts', './dist/language-http.d.ts');
} catch (error) {
  console.error(error);
  process.exit(1);
}
