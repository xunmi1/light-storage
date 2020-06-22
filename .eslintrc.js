const prettierConfig = require('@xunmi/prettier-config');

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: 'babel-eslint',
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'no-console': 'error',
    'no-undef': 'off',
    'no-var': 'error',
    'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
    'array-callback-return': 'error',
    'no-labels': 'error',
    'no-new-func': 'error',
    'no-loop-func': 'error',
    'no-self-compare': 'error',
    'func-names': 'off',
    'new-cap': 'error',
    'require-await': 'off',
    'no-script-url': 'error',
    'guard-for-in': 'error',
    'no-extend-native': 'error',
    'no-unused-expressions': 'error',
    'object-shorthand': 'warn',
    'no-useless-escape': 'error',
    'dot-notation': 'error',
    'no-unneeded-ternary': 'error',
    // prettier config
    'prettier/prettier': ['error', prettierConfig],
  },
};
