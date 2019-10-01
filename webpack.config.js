/*
  Imaginary Teleprompter
  Copyright (C) 2019 Imaginary Sense Inc.

  This file is part of Imaginary Teleprompter.

  Imaginary Teleprompter is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Imaginary Teleprompter is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with Imaginary Teleprompter.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

const path = require( 'path' );
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {

  // mode: 'development',

  // https://webpack.js.org/configuration/entry-context/
  entry: ['./app/main.js'],
  
  // https://webpack.js.org/configuration/output/
  output: {
    path: path.resolve( __dirname, 'dist' ),
    filename: 'imaginary-teleprompter-app.js'
  },

  // https://webpack.js.org/configuration/plugins/
  plugins: [
    new BrowserSyncPlugin({
      // browse to http://localhost:7313/ during development,
      // ./public directory is being served
      host: 'localhost',
      port: 7313,
      server: { baseDir: ['./'] },
      files: ['./editor.html', './app/*.js', './app/*.css'],
      index: './editor.html'
    })
  ],

  module: {
    rules: [
      // Code to import Bootstrap styles
      {
        test: /\.(scss)$/,
        use: [ {
            loader: 'style-loader' // inject CSS to page with a `<style>` tag
          }, {
            loader: 'css-loader' // translates CSS into CommonJS modules
          }, {
            loader: 'postcss-loader', // loader for webpack, runs post css actions
            options: {
              plugins: function () { // post css plugins, can be exported to postcss.config.js
                return [
                  require('precss'),
                  require('autoprefixer')
                ];
              }
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader'
          }
        ]
      },
      // Code to import CKEditor 5 styles
      {
        // Or /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/ if you want to limit this loader
        // to CKEditor 5 icons only.
        test: /\.svg$/,
        use: [ 'raw-loader' ]
      },
      {
        // Or /ckeditor5-[^/]+\/theme\/[^/]+\.css$/ if you want to limit this loader
        // to CKEditor 5 theme only.
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              singleton: true
            }
          },
          {
            loader: 'postcss-loader',
            options: styles.getPostCssConfig( {
              themeImporter: {
                themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
              },
              minify: true
            } )
          }
        ],
      }
    ]
  },

  // Useful for debugging.
  devtool: 'source-map',

  // By default webpack logs warnings if the bundle is bigger than 200kb.
  performance: { hints: false }
};
