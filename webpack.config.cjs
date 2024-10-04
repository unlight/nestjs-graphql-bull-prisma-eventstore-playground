const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (env, options) => {
  const transpileModules = [
    'pupa',
    'modern-errors',
    'error-custom-class',
    'error-class-utils',
    'is-error-instance',
    'merge-error-cause',
    'normalize-exception',
    'is-plain-obj',
    'set-error-class',
    'set-error-props',
    'redefine-property',
    'wrap-error-message',
    'set-error-message',
    'filter-obj',
    'set-error-stack',
    'modern-errors-clean',
    'clean-stack',
  ];
  /**
   * @type {import('webpack').Configuration}
   */
  const config = {
    entry: ['./src/main.ts'],
    target: 'node',
    externals: [
      nodeExternals({
        allowlist: transpileModules,
      }),
    ],
    devtool: 'source-map',
    module: {
      rules: [
        { parser: { amd: false } },
        {
          test: file => {
            if (file.slice(-4) === '.tsx') return true;
            if (file.slice(-3) === '.ts') return true;
            return transpileModules.find(name =>
              `node_modules${path.sep}${name}`.includes(file),
            );
          },
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                declaration: false,
                declarationMap: false,
              },
            },
          },
        },
      ],
    },
    mode: 'development',
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      plugins: [new TsconfigPathsPlugin()],
    },
    plugins: [
      new NodemonPlugin({
        script: './dist/server.js',
        watch: path.resolve('./dist/server.js'),
        ignore: ['*.js.map', '*.d.ts'],
        ext: 'js,json',
        delay: 500,
        verbose: false,
        ...(env.inspect && { nodeArgs: ['--inspect'] }),
      }),
    ],
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'server.js',
    },
  };

  return config;
};
