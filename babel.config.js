module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      ['module:react-native-dotenv'],
      '@babel/plugin-transform-class-static-block', // Add this plugin
    ],
  };
};
