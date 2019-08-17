module.exports = function (api) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 2%', 'last 2 versions', 'not ie <= 8'],
        },
        modules: false,
      },
    ],
  ];
  const plugins = [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods'
  ];
  const exclude = 'node_modules/**';
  const ignore = ['dist/*.js'];

  return {
    presets,
    plugins,
    exclude,
    ignore,
  };
};
