import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from "rollup-plugin-eslint";
import { terser } from 'rollup-plugin-terser';
import { author, name, version } from '../package.json';

const currentYear = new Date().getFullYear();
const banner =
`/**
 * ${name} v${version}
 * (c) ${currentYear > 2019 ? '2019-' : ''}${currentYear} ${author}
 * Released under the MIT License.
 */
`;

const outputFileList = [
  { name: 'LightStorage', format: 'umd' },
  { name: 'LightStorage', format: 'umd', min: true },
  { format: 'esm' },
  { format: 'esm', min: true },
];

const output = outputFileList.map(value => {
  value.file = `dist/light-storage.${value.format}${value.min ? '.min' : ''}.js`;
  value.sourcemap = !value.min;
  value.banner = banner;
  return value;
});

const eslintOptions = {
  fix: true,
  throwOnError: true,
  include: 'src/*.js'
};

const terserOptions = {
  include: [/^.+\.min\.js$/],
  output: { comments: `/${name} v${version}/` },
};

export default {
  input: 'src/main.js',
  output,
  plugins: [
    eslint(eslintOptions),
    resolve(),
    json(),
    babel(),
    commonjs(),
    terser(terserOptions),
  ],
};

