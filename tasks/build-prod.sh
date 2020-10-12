#!/bin/bash

export NODE_ENV=production BUILD_TIME=$(eval echo `date +'%s'`)
npm run -s clean
source tasks/common/build-all.sh & run-s --silent build:client:modern & wait
