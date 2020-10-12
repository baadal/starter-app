#!/bin/bash

export NODE_ENV=production BUILD_TIME=$(eval echo `date +'%s'`)
npm run -s verify
npm run -s clean
source tasks/common/build-all.sh & run-p --silent build:client:modern type-check & wait
source tasks/common/launch-server.sh & source tasks/common/launch-api.sh & wait
