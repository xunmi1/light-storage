import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from '../package.json';

const RUNTIME_CONTEXT = 'window';

const currentYear = new Date().getFullYear();
const banner =
`/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${currentYear > 2019 ? '2019-' : ''}${currentYear} ${pkg.author}
 * Released under the MIT License.
 */
`;

const outputFileList = [
  { name: 'LightStorage', format: 'umd' },
  { name: 'LightStorage', format: 'umd', min: true },
  { format: 'esm' },
  { format: 'esm', min: true },
];

const output = outputFileList.map(({ name, format, min }) => {
  const file = `dist/${pkg.name}.${format}${min ? '.min' : ''}.js`;
  const plugins = min ? [terser()] : [];
  return { file, name, format, banner, sourcemap: false, plugins };
});

export default {
  context: RUNTIME_CONTEXT,
  output,
  plugins: [
    json(),
    resolve(),
  ],
};

