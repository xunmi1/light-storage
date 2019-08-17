import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.js',
  output: [
    { file: 'dist/light-storage.umd.js', name: 'LightStorage', format: 'umd', sourcemap: true },
    { file: 'dist/light-storage.esm.js', format: 'es', sourcemap: true },
  ],
  plugins: [
    nodeResolve(),
    babel(),
    commonjs(),
    terser()
  ],
};

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}
