module.exports = function (api) {
  const isTest = api.env('test');
  api.cache(true);
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: '> 2%, last 2 versions, not ie <= 8, not dead',
          node: 'current',
          esmodules: isTest,
        },
      },
    ],
  ];
  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods'
  ];
  const exclude = 'node_modules/**';

  return {
    presets,
    plugins,
    exclude,
  };
};
