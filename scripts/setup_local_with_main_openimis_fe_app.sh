#!/bin/env bash

libs='react react-dom react-router react-router-dom "@material-ui/core" react-redux'
(
  cd ../openimis-dev/openimis-fe_js/node_modules/
  for lib in $libs; do
    (cd $lib && yarn link)
  done
)
yarn install
for lib in $libs; do
  yarn $lib
done
yarn link
(cd ../openimis-dev/openimis-fe_js/ && yarn link "@openimis/fe-qmoney-payment")
