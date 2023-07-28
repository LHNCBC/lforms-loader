import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
export default {
  input: 'source/lformsLoader.js',
  output: {
    file: 'dist/lformsLoader.js',
    format: 'es',
    name: 'MyModule'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
