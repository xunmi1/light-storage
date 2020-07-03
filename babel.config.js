module.exports = function (api) {
  const isTest = api.env('test');
  api.cache(true);
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: '> 1%, last 2 versions, not dead',
          esmodules: isTest ? true : undefined,
        },
        spec: true,
      },
    ],
    '@babel/preset-typescript'
  ];
  const exclude = 'node_modules/**';

  return {
    presets,
    exclude,
  };
};
