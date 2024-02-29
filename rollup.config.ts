import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    // {
    //   file: 'dist/bundle.js',
    //   format: 'iife',
    //   sourcemap: true,
    //   globals: {
    //     'react': 'React',
    //     'react-dom': 'ReactDOM',
    //     'react/jsx-runtime': 'jsxRuntime',
    //     '@material-ui/core': 'MuiCore'
    //   }
    // }
  ],
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@material-ui/core'
  //   /^@babel.*/,
  //   /^@date-io\/.*/,
  //   /^@material-ui\/.*/,
  //   /^@openimis.*/,
  //   "classnames",
  //   "clsx",
  //   "history",
  //   /^lodash.*/,
  //   "moment",
  //   "prop-types",
  //   /^react.*/,
  //   /^redux.*/
  ],
  plugins: [
    nodeResolve({
      browser: true,
    }),
    json(),
    replace({
          'preventAssignment': true,
          'process.env.NODE_ENV': JSON.stringify( 'development' )
        }),
    commonjs({
      include: 'node_modules/**',
    }),
    babel({
      babelrc: true,
      exclude: 'node_modules/**',
      babelHelpers: 'runtime',
    }),
  ]
}