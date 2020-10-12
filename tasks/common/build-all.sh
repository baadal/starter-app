#!/bin/bash

node tasks/build-extra.mjs
source tasks/common/build-build.sh & run-p --silent build:client build:server & wait
