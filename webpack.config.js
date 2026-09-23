const path = require("path");

module.exports = {
  entry: { panel: path.resolve(__dirname, "src", "panel.ts") },
  // The panel is loaded with import(), so the bundle is a real ES module and
  // the pieces below are pulled in with import statements.
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'custom_components/ihcviewer/frontend'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    module: true,
    chunkFormat: 'module',
    // Resolve the pieces next to panel.js, wherever the panel is served from
    publicPath: 'auto',
  },
  optimization: {
    // The pieces are named here rather than sized by maxSize. maxSize splits
    // the entry itself, and then there is no panel.js left to point the panel
    // at - the names also have to stay the same from build to build so a
    // rebuilt piece replaces the one that is already there.
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/](node_modules|homeassistant-frontend)[\\/]/,
          name: 'vendor',
          chunks: 'all',
          enforce: true,
        },
        controller: {
          test: /[\\/]src[\\/]elements[\\/]ihc-controller-element/,
          name: 'element-controller',
          chunks: 'all',
          enforce: true,
        },
        properties: {
          test: /[\\/]src[\\/]elements[\\/]ihc-properties-element/,
          name: 'element-properties',
          chunks: 'all',
          enforce: true,
        },
        tree: {
          test: /[\\/]src[\\/]elements[\\/]ihc-tree-node/,
          name: 'element-tree',
          chunks: 'all',
          enforce: true,
        },
        // The texts in all the languages, in a piece of their own. They are
        // pure data, so a new language moves this file and nothing else.
        localize: {
          test: /[\\/]src[\\/]localize[\\/]/,
          name: 'localize',
          chunks: 'all',
          enforce: true,
        },
        elements: {
          test: /[\\/]src[\\/]elements[\\/]/,
          name: 'elements',
          chunks: 'all',
          enforce: true,
        },
        dialogs: {
          test: /[\\/]src[\\/]dialogs[\\/]/,
          name: 'dialogs',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  devtool: 'source-map',
  resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: [
        "/node_modules/",
        "/homeassistant-frontend/",
      ],
      use: [{
        loader: 'ts-loader',
      }]
    }]
  },
  plugins: [
  ]
};
