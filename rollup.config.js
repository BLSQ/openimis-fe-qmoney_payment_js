import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

import React from 'react';
import ReactIs from 'react-is';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const config = {
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: true
    }),
    json(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'globalThis.process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    commonjs({
      include: [/node_modules|react.*/],
      namedExports: {
        'react-is': Object.keys(ReactIs),
        react: Object.keys(React),
        'react-dom': Object.keys(ReactDOM),
        'prop-types': Object.keys(PropTypes)
      }
    }),
    babel({
      babelrc: true,
      exclude: /^(.+\/)?node_modules\/.+$/,
      babelHelpers: 'runtime'
    })
  ]
};

export default [
  {
    ...config,
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
      }
    ],
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@material-ui/core',
      /^@babel.*/,
      /^@date-io\/.*/,
      /^@material-ui\/.*/,
      /^@openimis.*/,
      'classnames',
      'clsx',
      'history',
      /^lodash.*/,
      'moment',
      'prop-types',
      /^react.*/,
      /^redux.*/
    ]
  }
  // ,{
  //   ...config,
  //   input: 'src/standalone.js',
  //   output: [
  //     {
  //       file: 'dist/standalone.js',
  //       format: 'cjs',
  //       sourcemap: true
  //     }
  //   ],
  //   external: [
  //   ]
  // }
];
